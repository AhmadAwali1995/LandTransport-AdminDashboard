export interface AdminEmployeeListItemDto {
  id: number
  enName: string
  arName: string
  phoneNumber: string | null
  jobEmail: string | null
  title: string | null
  departmentEnName: string | null
  isOfficeOwner: boolean
  startingDate: string
  officeId: number | null
  officeEnName: string | null
}
