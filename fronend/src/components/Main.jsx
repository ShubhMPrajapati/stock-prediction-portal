// import { Footer } from "./Footer"
// import { Header } from "./Header"

export const Main = () => {
  return (
    <>
      
      <div className="container">
        <div className="p-5 text-center bg-light-dark rounded">
          <h1 className="text-light">Stock Prediction Portal</h1>
          <p className="text-light lead"> This stock prediction application uses machine learning with Keras and an LSTM model, all built within the Django framework. It forecasts future stock prices by analyzing important trends like the 100-day and 200-day moving averages, which are commonly used by analysts to make smarter trading and investment decisions.</p>
          {/* <a className="btn btn-outline-info" href="">Login</a> */}
        </div>
      </div>
      
    </>
  )
}
