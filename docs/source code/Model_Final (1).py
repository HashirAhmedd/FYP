import tensorflow as tf
import numpy as np
import pandas as pd
from pyspark.sql import SparkSession
from pyspark.ml.functions import vector_to_array 
from tensorflow.keras.layers import Layer, Embedding, Dropout, Dense, LayerNormalization, Concatenate, Input, MultiHeadAttention
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from pyspark.sql.functions import col 
import keras
import os
import random

# --- RELIABILITY FIX 1: REPRODUCIBILITY SEEDS ---
SEED = 42
os.environ['PYTHONHASHSEED'] = str(SEED)
random.seed(SEED)
np.random.seed(SEED)
tf.random.set_seed(SEED)

# --- CONFIGURATION ---
SEQUENCE_LENGTH = 12
PROJECTION_DIM = 64     
EMBEDDING_DIM = 8
NUM_ENCODER_LAYERS = 2  
FF_DIM = 128            
DROPOUT_RATE = 0.1
LEARNING_RATE = 1e-3
NUM_NUMERICAL_FEATURES = 6 
BATCH_SIZE = 2048       

CAT_FEATURES = ['iso3_country_index', 'sector_index', 'subsector_index', 'gas_index']
LAGGED_EMISSIONS = [f"emissions_t_{i}" for i in range(1, SEQUENCE_LENGTH + 1)]
PARQUET_PATH = r"C:\Users\USER\preprocessed_ghg_sequences2.parquet"  # Ensure this matches your file location

# --- Custom Layers (Aligned with API) ---
@keras.saving.register_keras_serializable()
class PositionalEmbedding(Layer):
    def __init__(self, sequence_length, output_dim, **kwargs):
        super().__init__(**kwargs)
        self.sequence_length = sequence_length
        self.output_dim = output_dim
        self.position_embedding = Embedding(input_dim=sequence_length, output_dim=output_dim)
    def call(self, inputs):
        positions = tf.range(start=0, limit=self.sequence_length, delta=1)
        return inputs + self.position_embedding(positions)
    def get_config(self):
        config = super().get_config()
        config.update({"sequence_length": self.sequence_length, "output_dim": self.output_dim})
        return config

@keras.saving.register_keras_serializable()
class TransformerEncoder(Layer):
    def __init__(self, embed_dim, num_heads, ff_dim, rate=0.2, **kwargs):
        super().__init__(**kwargs)
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.ff_dim = ff_dim
        self.rate = rate
        self.att = MultiHeadAttention(num_heads=num_heads, key_dim=embed_dim)
        self.ffn = tf.keras.Sequential([
            Dense(ff_dim, activation="relu"), 
            Dense(embed_dim),
        ])
        self.layernorm1 = LayerNormalization(epsilon=1e-6)
        self.layernorm2 = LayerNormalization(epsilon=1e-6)
        self.dropout1 = Dropout(rate)
        self.dropout2 = Dropout(rate)
    def call(self, inputs, training=None):
        attn_output = self.att(inputs, inputs)
        attn_output = self.dropout1(attn_output, training=training)
        out1 = self.layernorm1(inputs + attn_output)
        ffn_output = self.ffn(out1)
        ffn_output = self.dropout2(ffn_output, training=training)
        return self.layernorm2(out1 + ffn_output)
    def get_config(self):
        config = super().get_config()
        config.update({"embed_dim": self.embed_dim, "num_heads": self.num_heads, "ff_dim": self.ff_dim, "rate": self.rate})
        return config

def create_transformer_model(country_vocab, sector_vocab, subsector_vocab, gas_vocab):
    cat_input_country = Input(shape=(SEQUENCE_LENGTH,), dtype=tf.int32, name='country_input')
    cat_input_sector = Input(shape=(SEQUENCE_LENGTH,), dtype=tf.int32, name='sector_input')
    cat_input_subsector = Input(shape=(SEQUENCE_LENGTH,), dtype=tf.int32, name='subsector_input')
    cat_input_gas = Input(shape=(SEQUENCE_LENGTH,), dtype=tf.int32, name='gas_input')
    num_input = Input(shape=(SEQUENCE_LENGTH, NUM_NUMERICAL_FEATURES), dtype=tf.float32, name='numerical_input')
    
    emb_country = Embedding(country_vocab, EMBEDDING_DIM, name='emb_country')(cat_input_country)
    emb_sector = Embedding(sector_vocab, EMBEDDING_DIM, name='emb_sector')(cat_input_sector)
    emb_subsector = Embedding(subsector_vocab, EMBEDDING_DIM, name='emb_subsector')(cat_input_subsector)
    emb_gas = Embedding(gas_vocab, EMBEDDING_DIM, name='emb_gas')(cat_input_gas)
    
    cat_embeddings = Concatenate(axis=-1)([emb_country, emb_sector, emb_subsector, emb_gas])
    combined_features = Concatenate(axis=-1)([cat_embeddings, num_input])

    projected_features = Dense(PROJECTION_DIM, name="projection_dense")(combined_features)
    encoded_features = PositionalEmbedding(SEQUENCE_LENGTH, PROJECTION_DIM, name="positional_embedding")(projected_features)

    x = encoded_features
    for i in range(NUM_ENCODER_LAYERS):
        x = TransformerEncoder(PROJECTION_DIM, 8, FF_DIM, DROPOUT_RATE, name=f'transformer_encoder_{i}')(x)
    
    # --- CRITICAL FIX FOR API COMPATIBILITY ---
    # We name the layer "output_dense" so XAI scripts can find it reliably
    output_sequence = Dense(1, name="output_dense")(x)
    output = tf.keras.layers.Lambda(lambda t: tf.squeeze(t, axis=-1), name="output_squeeze")(output_sequence)
    
    model = Model(
        inputs=[cat_input_country, cat_input_sector, cat_input_subsector, cat_input_gas, num_input],
        outputs=output,
        name="GHG_Transformer"
    )
    return model

# --- DATA LOADING ---
def load_and_structure_data_vectorized(parquet_path):
    try:
        spark = SparkSession.builder.appName("FullDataPrep").config("spark.driver.memory", "8g").getOrCreate()
    except Exception as e:
        print(f"Error initializing Spark: {e}")
        return [], [], [], [0, 0, 0, 0]

    print(f"Loading data from {parquet_path}...")
    spark_df = spark.read.parquet(parquet_path)
    df_temp = spark_df.withColumn("num_array", vector_to_array(col("numerical_features_scaled")))
    print("Converting to Pandas...")
    pandas_df = df_temp.select(*CAT_FEATURES, 'emissions_quantity_log', 'start_month', *LAGGED_EMISSIONS, "num_array").toPandas()
    spark.stop()
    
    print(f"Data Loaded. Rows: {len(pandas_df)}")
    
    # Categorical
    VOCAB_SIZES = [int(pandas_df[f].max() + 1) for f in CAT_FEATURES]
    X_cat_list = []
    for feature in CAT_FEATURES:
        cat_index = pandas_df[feature].to_numpy().astype(np.int32)
        X_cat_sequence = np.tile(cat_index[:, None], (1, SEQUENCE_LENGTH))
        X_cat_list.append(X_cat_sequence)

    # Numerical
    X_T0 = np.stack(pandas_df["num_array"].to_numpy()).astype(np.float32)
    X_num = np.tile(X_T0[:, None, :], (1, SEQUENCE_LENGTH, 1))
    
    # Reconstruct History (Sin/Cos)
    start_months = pandas_df['start_month'].to_numpy().astype(np.int32)
    offsets = np.arange(SEQUENCE_LENGTH)[None, :]
    month_sequence = start_months[:, None] - offsets
    
    PI = np.float32(np.pi)
    X_num[:, :, 4] = np.sin(2 * PI * month_sequence / 12.0)
    X_num[:, :, 5] = np.cos(2 * PI * month_sequence / 12.0)
    X_num = X_num[:, ::-1, :]

    # Targets
    Y_cols = ['emissions_quantity_log'] + LAGGED_EMISSIONS
    Y_data = pandas_df[Y_cols].to_numpy().astype(np.float32)
    Y = Y_data[:, :SEQUENCE_LENGTH][:, ::-1]

    # Safety Clean
    if not np.all(np.isfinite(Y)) or not np.all(np.isfinite(X_num)):
        mask = np.all(np.isfinite(Y), axis=1) & np.all(np.isfinite(X_num), axis=(1, 2))
        X_cat_list = [x[mask] for x in X_cat_list]
        X_num = X_num[mask]
        Y = Y[mask]
        VOCAB_SIZES = [int(x.max() + 1) for x in X_cat_list]

    print(f"Processing Complete. N={len(Y)}")
    return X_cat_list, X_num, Y, VOCAB_SIZES

# --- EXECUTION ---

if __name__ == "__main__":
    X_cat, X_num, Y, VOCAB_SIZES = load_and_structure_data_vectorized(PARQUET_PATH)
    COUNTRY_VOCAB, SECTOR_VOCAB, SUBSECTOR_VOCAB, GAS_VOCAB = VOCAB_SIZES

    print(f"\n--- Initializing Model (Dim: {PROJECTION_DIM}) ---")
    model = create_transformer_model(COUNTRY_VOCAB, SECTOR_VOCAB, SUBSECTOR_VOCAB, GAS_VOCAB)

    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE),
        loss=tf.keras.losses.Huber(delta=1.0), 
        metrics=['mae', 'mse', 'mape', tf.keras.metrics.R2Score()]
    )

    split_idx = int(len(Y) * 0.8)
    X_train_cat = [x[:split_idx] for x in X_cat]
    X_val_cat = [x[split_idx:] for x in X_cat]
    X_train_num = X_num[:split_idx]
    X_val_num = X_num[split_idx:]
    Y_train = Y[:split_idx]
    Y_val = Y[split_idx:]

    def make_dataset(x_cat, x_num, y, batch_size):
        dataset = tf.data.Dataset.from_tensor_slices((tuple(x_cat + [x_num]), y))
        return dataset.batch(batch_size).prefetch(tf.data.AUTOTUNE)

    train_ds = make_dataset(X_train_cat, X_train_num, Y_train, BATCH_SIZE)
    val_ds = make_dataset(X_val_cat, X_val_num, Y_val, BATCH_SIZE)

    print("\nStarting Training...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=50, 
        callbacks=[
            tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True),
            tf.keras.callbacks.ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3)
        ]
    )

    save_name = "final_ghg_transformer_model_FIXED.keras"
    model.save(save_name)
    print(f"\n✅ Model saved as '{save_name}'")
    
    # Stress Test
    print("\n--- POLICY RELIABILITY CHECK ---")
    threshold = np.percentile(Y_val, 90)
    high_emission_indices = np.where(Y_val > threshold)[0]
    
    X_stress_cat = [x[high_emission_indices] for x in X_val_cat]
    X_stress_num = X_val_num[high_emission_indices]
    Y_stress = Y_val[high_emission_indices]
    
    stress_results = model.evaluate(X_stress_cat + [X_stress_num], Y_stress, verbose=0)
    print(f"High-Emission MAE: {stress_results[1]:.4f}")
    
    if stress_results[2] < 20: 
        print("✅ PASSED: Model is robust for high-pollution events.")
    else:
        print("⚠️ WARNING: Model struggles with extreme outliers.")