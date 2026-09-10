import type { SeatRow } from '../types/vehicleTemplate'

function isSeat(cell: string) {
  return cell !== 'aisle' && cell !== 'empty'
}

function seatLabel(code: string) {
  const id = String(code)
  return id.replace(/^\d+/, '') || id
}

export default function SeatLayoutPreview({
  rows = [],
  emptyMessage = 'No seat layout stored for this template.',
}: {
  rows?: SeatRow[]
  emptyMessage?: string
}) {
  if (!rows.length) {
    return <p className="seat-map__empty">{emptyMessage}</p>
  }

  return (
    <div className="seat-map seat-map--readonly">
      <div className="seat-map__front"><span>Front</span></div>
      <div className="seat-map__rows seat-map__rows--editor">
        {rows.map((cells, rowIndex) => (
          <div key={rowIndex} className="seat-map__row seat-map__row--editor">
            <div className="seat-map__row-cells">
              <span className="seat-map__row-num">{rowIndex + 1}</span>
              {cells.length === 0 ? (
                <span className="seat-map__empty-row">Empty row</span>
              ) : (
                cells.map((cell, cellIndex) => {
                  if (cell === 'aisle' || cell === 'empty') {
                    return (
                      <span
                        key={`${rowIndex}-space-${cellIndex}`}
                        className="seat-map__aisle seat-map__aisle--visible"
                      >
                        ·
                      </span>
                    )
                  }
                  if (!isSeat(cell)) return null
                  return (
                    <span
                      key={`${rowIndex}-${cell}-${cellIndex}`}
                      className="seat-map__seat"
                      title={String(cell)}
                    >
                      {seatLabel(String(cell))}
                    </span>
                  )
                })
              )}
              <span className="seat-map__row-num">{rowIndex + 1}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="seat-map__back"><span>Back</span></div>
    </div>
  )
}
