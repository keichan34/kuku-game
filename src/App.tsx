import 'bootstrap/dist/css/bootstrap.min.css'
import GameContainer from './components/GameContainer'
import SetupContainer from './components/SetupContainer'
import { useAtomValue } from 'jotai'
import { phaseAtom } from './state/atoms'

function App() {
  const phase = useAtomValue(phaseAtom)
  return phase === 'setup' ? <SetupContainer /> : <GameContainer />
}

export default App
