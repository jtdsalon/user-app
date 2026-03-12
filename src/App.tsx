import { BrowserRouter as Router } from 'react-router-dom'
import AppRoutes from './routes';

import { BASE_PATH } from './routes/routeConfig'

function App(): JSX.Element {
  return (
    <Router basename={BASE_PATH}>
      <AppRoutes />
    </Router>
  )
}

export default App
