import Logo from './Logo.jsx';
import ModeSwitch from './ModeSwitch.jsx';
import LandPanel from './LandPanel.jsx';
import RoomsPanel from './RoomsPanel.jsx';
import StatsPanel from './StatsPanel.jsx';
import DataPanel from './DataPanel.jsx';

export default function Sidebar({ state, stats, actions }) {
  return (
    <aside className="sidebar">
      <Logo />
      <ModeSwitch mode={state.mode} onChange={actions.setMode} />
      {state.mode === 'land' ? (
        <LandPanel landTool={state.landTool} actions={actions} />
      ) : (
        <RoomsPanel
          activeTemplate={state.activeTemplate}
          ghostRotation={state.ghostRotation}
          roomTool={state.roomTool}
          actions={actions}
        />
      )}
      <StatsPanel stats={stats} />
      <DataPanel actions={actions} />
    </aside>
  );
}
