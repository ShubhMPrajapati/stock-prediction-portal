from django.shortcuts import render 
from rest_framework.views import APIView
from .serializers import StockPredictionSerializers
from rest_framework import status
from rest_framework.response import Response
import yfinance as yf
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime
from .utils import save_plot
from keras.models import load_model
import joblib
from sklearn.metrics import mean_squared_error, r2_score

# Load model and scaler once
MULTIVARIATE_MODEL_PATH = 'multivariate_LSTM_model.keras'
SCALER_PATH = 'multivariate_scaler.pkl'
FEATURES = ['Open', 'High', 'Low', 'Close', 'Volume']
TIMESTEPS = 60

model = load_model(MULTIVARIATE_MODEL_PATH)
scaler = joblib.load(SCALER_PATH)


class StockPredictionAPIView(APIView):
    def post(self, request):
        serializer = StockPredictionSerializers(data=request.data)
        if serializer.is_valid():
            ticker = serializer.validated_data['ticker'].upper()

            # Fetch historical data
            now = datetime.now()
            start = datetime(now.year - 10, now.month, now.day)
            df = yf.download(ticker, start, now)
            if df.empty:
                return Response({"error": "No data found for the given ticker."},
                                status=status.HTTP_404_NOT_FOUND)
            df = df.reset_index()
            
            # Current price
            current_price = float(df['Close'].iloc[-1])

            # Closing Price Plot
            plt.switch_backend('AGG')
            plt.figure(figsize=(12, 5))
            plt.plot(df['Close'], label='Closing Price')
            plt.title(f'Closing Price of {ticker}')
            plt.xlabel('Days')
            plt.ylabel('Price')
            plt.legend()
            plot_img = save_plot(f'{ticker}_plot.png')

            # 100 & 200 Days Moving Averages
            ma100 = df['Close'].rolling(100).mean()
            ma200 = df['Close'].rolling(200).mean()
            plt.figure(figsize=(12, 5))
            plt.plot(df['Close'], label='Closing Price')
            plt.plot(ma100, 'r', label='100 DMA')
            plt.plot(ma200, 'g', label='200 DMA')
            plt.title(f'Moving Averages of {ticker}')
            plt.xlabel('Days')
            plt.ylabel('Price')
            plt.legend()
            plot_moving_avg = save_plot(f'{ticker}_moving_averages.png')

            # Prepare data for multivariate LSTM prediction
            df_features = df[FEATURES].copy()
            scaled_data = scaler.transform(df_features.values)

            # Create sequences for prediction
            X_input = []
            for i in range(len(scaled_data) - TIMESTEPS, len(scaled_data)):
                X_input.append(scaled_data[i - TIMESTEPS:i, :])
            X_input = np.array(X_input)

            # Next 5 days prediction
            next_5_days_scaled = []
            temp_input = X_input[-1].reshape(1, TIMESTEPS, len(FEATURES))
            
            for _ in range(5):
                pred_scaled = model.predict(temp_input)
                next_5_days_scaled.append(pred_scaled[0,0])
                
                # Shift and append predicted Close
                next_row = np.zeros((1, 1, len(FEATURES)))
                next_row[0, 0, FEATURES.index('Close')] = pred_scaled
                temp_input = np.append(temp_input[:,1:,:], next_row, axis=1)
            
            # Convert predictions back to original scale
            next_5_days = []
            for scaled_val in next_5_days_scaled:
                val = np.zeros((1, len(FEATURES)))
                val[0, FEATURES.index('Close')] = scaled_val
                inv = scaler.inverse_transform(val)
                next_5_days.append(float(inv[0, FEATURES.index('Close')]))

            # Evaluation on last 100+ days (optional)
            # Here we just use the last TIMESTEPS for demonstration
            x_test = X_input
            y_test_scaled = df_features['Close'].values[-len(x_test):].reshape(-1,1)
            y_pred_scaled = model.predict(x_test)
            
            y_test = []
            y_pred = []
            for yt, yp in zip(y_test_scaled, y_pred_scaled):
                val_true = np.zeros((1, len(FEATURES)))
                val_pred = np.zeros((1, len(FEATURES)))
                val_true[0, FEATURES.index('Close')] = yt
                val_pred[0, FEATURES.index('Close')] = yp
                y_test.append(scaler.inverse_transform(val_true)[0, FEATURES.index('Close')])
                y_pred.append(scaler.inverse_transform(val_pred)[0, FEATURES.index('Close')])
            
            # Prediction plot
            plt.figure(figsize=(12, 5))
            plt.plot(y_test, 'b', label='Original Price')
            plt.plot(y_pred, 'r', label='Predicted Price')
            plt.title(f'Multivariate LSTM Prediction vs Actual for {ticker}')
            plt.xlabel('Days')
            plt.ylabel('Price')
            plt.legend()
            plot_prediction = save_plot(f'{ticker}_final_prediction.png')

            # Model evaluation
            mse = mean_squared_error(y_test, y_pred)
            rmse = np.sqrt(mse)
            r2 = r2_score(y_test, y_pred)

            return Response({
                'status': 'success',
                'current_price': current_price,
                'plot_img': plot_img,
                'plot_moving_avg': plot_moving_avg,
                'plot_prediction': plot_prediction,
                'mse': float(mse),
                'rmse': float(rmse),
                'r2': float(r2),
                'next_5_days_prediction': next_5_days
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
