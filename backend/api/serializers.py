# from rest_framework import serializers

# class StockPredictionSerializers(serializers.Serializer):
#     ticker = serializers.CharField(max_length=30)
    
from rest_framework import serializers

class StockPredictionSerializers(serializers.Serializer):
    ticker = serializers.CharField(
        max_length=20, 
        min_length=1,
        help_text="Stock ticker symbol (e.g., AAPL, TSLA, GOOGL)"
    )
    
    def validate_ticker(self, value):
        """Validate ticker symbol"""
        if not value.isalpha():
            raise serializers.ValidationError("Ticker should contain only letters.")
        return value.upper()