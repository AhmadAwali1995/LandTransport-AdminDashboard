import { useRef } from 'react'
import type { SeatRow } from '../types/vehicleTemplate'

export const MAX_ROW_CELLS = 6

function isSeat(cell: string) {
  return cell !== 'aisle' && cell !== 'empty'
}

function letterAt(index: number) {
  let n = index + 1
  let label = ''
  while (n > 0) {
    n -= 1
    label = String.fromCharCode(65 + (n % 26)) + label
    n = Math.floor(n / 26)
  }
  return label
}

function seatLabel(code: string) {
  const id = String(code)
  return id.replace(/^\d+/, '') || id
}

function cloneRows(rows: SeatRow[]): SeatRow[] {
  return rows.map(row => [...row])
}

export function relabelRows(rows: SeatRow[]): SeatRow[] {
  return rows.map((row, rowIndex) => {
    let seatIndex = 0
    return row.map(cell => {
      if (!isSeat(cell)) return cell
      return `${rowIndex + 1}${letterAt(seatIndex++)}`
    })
  })
}

export function countSeats(rows: SeatRow[]) {
  return rows.reduce((sum, row) => sum + row.filter(isSeat).length, 0)
}

export default function SeatLayoutBuilder({
  rows,
  onChange,
}: {
  rows: SeatRow[]
  onChange: (rows: SeatRow[]) => void
}) {
  const rowHistoryRef = useRef<SeatRow[][]>([])

  const apply = (next: SeatRow[]) => {
    onChange(relabelRows(next))
  }

  const rememberRow = (rowIndex: number) => {
    const histories = rowHistoryRef.current
    while (histories.length < rows.length) histories.push([])
    if (!histories[rowIndex]) histories[rowIndex] = []
    histories[rowIndex].push([...(rows[rowIndex] ?? [])])
  }

  const insertHistory = (index: number) => {
    rowHistoryRef.current.splice(index, 0, [])
  }

  const removeHistory = (index: number) => {
    rowHistoryRef.current.splice(index, 1)
  }

  const addEmptyRow = (index: number) => {
    insertHistory(index)
    const next = cloneRows(rows)
    next.splice(index, 0, [])
    apply(next)
  }

  const addUpperLine = () => {
    if (rows.length > 0 && rows[0].length === 0) return
    addEmptyRow(0)
  }

  const addLowerLine = () => {
    if (rows.length > 0 && rows[rows.length - 1].length === 0) return
    addEmptyRow(rows.length)
  }

  const addSeat = (rowIndex: number) => {
    if ((rows[rowIndex]?.length ?? 0) >= MAX_ROW_CELLS) return
    rememberRow(rowIndex)
    const next = cloneRows(rows)
    next[rowIndex].push('seat')
    apply(next)
  }

  const addSpace = (rowIndex: number) => {
    if ((rows[rowIndex]?.length ?? 0) >= MAX_ROW_CELLS) return
    rememberRow(rowIndex)
    const next = cloneRows(rows)
    next[rowIndex].push('aisle')
    apply(next)
  }

  const undoRow = (rowIndex: number) => {
    const stack = rowHistoryRef.current[rowIndex]
    const prev = stack?.pop()
    if (!prev) return
    const next = cloneRows(rows)
    next[rowIndex] = prev.slice(0, MAX_ROW_CELLS)
    apply(next)
  }

  const clear = () => {
    if (!rows.length) return
    rowHistoryRef.current = []
    onChange([])
  }

  const removeCell = (rowIndex: number, cellIndex: number) => {
    rememberRow(rowIndex)
    const next = cloneRows(rows)
    next[rowIndex].splice(cellIndex, 1)
    apply(next)
  }

  const duplicateRow = (rowIndex: number) => {
    const next = cloneRows(rows)
    next.splice(rowIndex + 1, 0, [...next[rowIndex]])
    insertHistory(rowIndex + 1)
    apply(next)
  }

  const deleteRow = (rowIndex: number) => {
    const next = cloneRows(rows)
    next.splice(rowIndex, 1)
    removeHistory(rowIndex)
    apply(next)
  }

  const seats = countSeats(rows)

  return (
    <div className="seat-builder">
      <div className="seat-builder__toolbar">
        <button type="button" className="btn btn--ghost btn--sm" onClick={clear} disabled={!rows.length}>
          Clear
        </button>
        <span className="seat-builder__count">
          {seats} seat{seats !== 1 ? 's' : ''} · {rows.length} row{rows.length !== 1 ? 's' : ''}
        </span>
      </div>

      <p className="seat-builder__hint">
        Add a line above or below, then add seats and spaces on that line. Each line can have at most {MAX_ROW_CELLS} elements. Click a cell to remove it.
      </p>

      <div className="seat-map">
        <div className="seat-map__front">
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={addUpperLine}
            disabled={rows.length > 0 && rows[0].length === 0}
          >
            + Upper line
          </button>
          <span>Front</span>
        </div>
        {rows.length === 0 ? (
          <p className="seat-map__empty">No layout yet. Add an upper or lower line to start.</p>
        ) : (
          <div className="seat-map__rows seat-map__rows--editor">
            {rows.map((cells, rowIndex) => {
              const canUndoRow = (rowHistoryRef.current[rowIndex] ?? []).length > 0
              const rowFull = cells.length >= MAX_ROW_CELLS
              return (
                <div key={rowIndex} className="seat-map__row seat-map__row--editor">
                  <div className="seat-map__row-cells">
                    <span className="seat-map__row-num">{rowIndex + 1}</span>
                    {cells.length === 0 ? (
                      <span className="seat-map__empty-row">Empty row</span>
                    ) : (
                      cells.map((cell, cellIndex) => {
                        if (cell === 'aisle' || cell === 'empty') {
                          return (
                            <button
                              key={`${rowIndex}-space-${cellIndex}`}
                              type="button"
                              className="seat-map__aisle seat-map__aisle--visible"
                              title="Remove space"
                              onClick={() => removeCell(rowIndex, cellIndex)}
                            >
                              ·
                            </button>
                          )
                        }
                        return (
                          <button
                            key={`${rowIndex}-${cell}-${cellIndex}`}
                            type="button"
                            className="seat-map__seat seat-map__seat--editor"
                            title={`Remove ${cell}`}
                            onClick={() => removeCell(rowIndex, cellIndex)}
                          >
                            {seatLabel(String(cell))}
                          </button>
                        )
                      })
                    )}
                    <span className="seat-map__row-num">{rowIndex + 1}</span>
                  </div>
                  <div className="seat-map__row-actions">
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      onClick={() => addSeat(rowIndex)}
                      disabled={rowFull}
                      title={rowFull ? `Maximum ${MAX_ROW_CELLS} elements per line` : 'Add seat'}
                    >
                      + Seat
                    </button>
                    <button
                      type="button"
                      className="btn btn--outline-primary btn--sm"
                      onClick={() => addSpace(rowIndex)}
                      disabled={rowFull}
                      title={rowFull ? `Maximum ${MAX_ROW_CELLS} elements per line` : 'Add space'}
                    >
                      + Space
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => undoRow(rowIndex)}
                      disabled={!canUndoRow}
                    >
                      Undo
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--icon"
                      title="Duplicate line"
                      aria-label={`Duplicate row ${rowIndex + 1}`}
                      onClick={() => duplicateRow(rowIndex)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="8" y="8" width="12" height="12" rx="2" />
                        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--icon btn--icon-danger"
                      title="Delete line"
                      aria-label={`Delete row ${rowIndex + 1}`}
                      onClick={() => deleteRow(rowIndex)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 7h16" />
                        <path d="M9 7V5h6v2" />
                        <path d="M7 7l1 13h8l1-13" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <div className="seat-map__back">
          <span>Back</span>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={addLowerLine}
            disabled={rows.length > 0 && rows[rows.length - 1].length === 0}
          >
            + Lower line
          </button>
        </div>
      </div>
    </div>
  )
}
