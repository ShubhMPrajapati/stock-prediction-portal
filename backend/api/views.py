from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import StockPredictionSerializers
from rest_framework import status
from rest_framework.response import Response
import yfinance as yf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime
from .utils import save_plot
from sklearn.preprocessing import MinMaxScaler
from keras.models import load_model
from sklearn.metrics import mean_squared_error, r2_score


class StockPredictionAPIView(APIView):
    def post(self, request):
        serializer = StockPredictionSerializers(data=request.data)
        if serializer.is_valid():
            ticker = serializer.validated_data['ticker']

            # Fetch historical data
            now = datetime.now()
            start = datetime(now.year - 10, now.month, now.day)
            df = yf.download(ticker, start, now)
            if df.empty:
                return Response({"error": "No data found for the given ticker.",
                                 'status': status.HTTP_404_NOT_FOUND})
            df = df.reset_index()

            # Current price
            current_price = df.Close.iloc[-1]

            # Closing Price Plot
            plt.switch_backend('AGG')
            plt.figure(figsize=(12, 5))
            plt.plot(df.Close, label='Closing Price')
            plt.title(f'Closing Price of {ticker}')
            plt.xlabel('Days')
            plt.ylabel('Price')
            plt.legend()
            plot_img = save_plot(f'{ticker}_plot.png')

            # 100 & 200 Days Moving Averages
            ma100 = df.Close.rolling(100).mean()
            ma200 = df.Close.rolling(200).mean()
            plt.figure(figsize=(12, 5))
            plt.plot(df.Close, label='Closing Price')
            plt.plot(ma100, 'r', label='100 DMA')
            plt.plot(ma200, 'g', label='200 DMA')
            plt.title(f'Moving Averages of {ticker}')
            plt.xlabel('Days')
            plt.ylabel('Price')
            plt.legend()
            plot_moving_avg = save_plot(f'{ticker}_moving_averages.png')

            # Prepare training/testing data
            data_training = pd.DataFrame(df.Close[:int(len(df)*0.7)])
            data_testing = pd.DataFrame(df.Close[int(len(df)*0.7):])
            scaler = MinMaxScaler(feature_range=(0, 1))
            model = load_model('stock_prediction_model.keras')

            past_100_days = data_training.tail(100)
            final_df = pd.concat([past_100_days, data_testing], ignore_index=True)
            input_data = scaler.fit_transform(final_df)

            x_test, y_test = [], []
            for i in range(100, input_data.shape[0]):
                x_test.append(input_data[i-100:i])
                y_test.append(input_data[i, 0])
            x_test, y_test = np.array(x_test), np.array(y_test)

            # Predictions on test data
            y_predicted = model.predict(x_test)
            y_predicted = scaler.inverse_transform(y_predicted.reshape(-1, 1)).flatten()
            y_test = scaler.inverse_transform(y_test.reshape(-1, 1)).flatten()

            # Prediction plot
            plt.figure(figsize=(12, 5))
            plt.plot(y_test, 'b', label='Original Price')
            plt.plot(y_predicted, 'r', label='Predicted Price')
            plt.title(f'Prediction vs Actual for {ticker}')
            plt.xlabel('Days')
            plt.ylabel('Price')
            plt.legend()
            plot_prediction = save_plot(f'{ticker}_final_prediction.png')

            # Model evaluation
            mse = mean_squared_error(y_test, y_predicted)
            rmse = np.sqrt(mse)
            r2 = r2_score(y_test, y_predicted)

            # Next 5 days prediction
            last_100_days = df.Close[-100:].values
            scaled_last_100 = scaler.transform(last_100_days.reshape(-1, 1))
            x_input = scaled_last_100.reshape(1, 100, 1)
            next_5_days = []

            for _ in range(5):
                pred = model.predict(x_input)[0][0]
                next_5_days.append(pred)
                x_input = np.append(x_input[:, 1:, :], [[[pred]]], axis=1)

            next_5_days = scaler.inverse_transform(np.array(next_5_days).reshape(-1, 1)).flatten()

            return Response({
                'status': 'success',
                'current_price': float(current_price),
                'plot_img': plot_img,
                'plot_moving_avg': plot_moving_avg,
                'plot_prediction': plot_prediction,
                'mse': float(mse),
                'rmse': float(rmse),
                'r2': float(r2),
                'next_5_days_prediction': next_5_days.tolist()
            })
