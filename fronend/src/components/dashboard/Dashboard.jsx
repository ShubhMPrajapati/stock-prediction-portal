import { useEffect } from "react"
import { axiosInstance } from "../../axiosInstance"

export const Dashboard = () => {
    const accessToken = localStorage.getItem('access_token')

    useEffect(() => {
        const fetchProtectedData = async () => {
            try {
                const response = await axiosInstance.get('/protected-view/');

                console.log('Successfully fetch the data...')
            } catch (error) {
                console.log('Error fetching data')
            }
        }
        fetchProtectedData();
    }, [])
    return (
        <div className='text-light container'>Dashboard</div>
    )
}
