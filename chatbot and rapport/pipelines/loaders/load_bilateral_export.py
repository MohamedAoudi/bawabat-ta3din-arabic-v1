"""Compatibility wrapper: bilateral import/export are loaded by load_bilateral_trade."""
from pipelines.loaders.load_bilateral_trade import load

if __name__ == "__main__":
    load()
