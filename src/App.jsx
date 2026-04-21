import Canvas from './components/Canvas/index.jsx';
import Sidebar from './components/Sidebar/index.jsx';
import { useFloorPlan } from './hooks/useFloorPlan.js';

export default function App() {
  const { state, stats, actions, canPlaceHere } = useFloorPlan();

  return (
    <div className="app">
      <Sidebar state={state} stats={stats} actions={actions} />
      <Canvas state={state} actions={actions} canPlaceHere={canPlaceHere} />
    </div>
  );
}
