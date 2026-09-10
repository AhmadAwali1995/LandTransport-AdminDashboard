export interface VehicleSeatDto {
  id: number
  position: string | null
  description: string | null
}

export interface VehicleTemplateDto {
  id: number
  arName: string
  enName: string
  arDescription: string | null
  enDescription: string | null
  seatsCount: number
  htmlContent: string
  isInUse: boolean
  seats: VehicleSeatDto[]
}

export type SeatCell = string
export type SeatRow = SeatCell[]
