import ResultCard from './ResultCard.jsx'

export default function ListView({ features, selectedId, onSelect, hasSearch }) {
  if (!features.length) {
    return <div className="empty">No matching providers.</div>
  }
  return (
    <div className="list-view">
      <ol className="result-list">
        {features.map(f => (
          <ResultCard
            key={f.properties.dftaId || f.properties.name}
            feature={f}
            selected={selectedId === f.properties.dftaId}
            onSelect={() => onSelect(f.properties.dftaId)}
            showDistance={hasSearch}
          />
        ))}
      </ol>
    </div>
  )
}
