import APIBase from './httpBase'

export interface DeliveryPerson {
  _id?: string
  name: string
  identification: string
  phone?: string
  active?: boolean
}

export interface DeliveryReport {
  total: number
  count: number
  summary: Array<{
    name: string
    total: number
    count: number
  }>
  orders: any[]
}

class DeliveryService extends APIBase {
  async getPersonnel(): Promise<DeliveryPerson[]> {
    const response = await this.get<{ data: DeliveryPerson[] }>('delivery-personnel')
    return response.data.data
  }

  async createPerson(data: Partial<DeliveryPerson>): Promise<DeliveryPerson> {
    const response = await this.post<{ data: DeliveryPerson }>('delivery-personnel', data)
    return response.data.data
  }

  async updatePerson(id: string, data: Partial<DeliveryPerson>): Promise<DeliveryPerson> {
    const response = await this.put<{ data: DeliveryPerson }>(`delivery-personnel/${id}`, data)
    return response.data.data
  }

  async getReport(startDate: string, endDate: string, personId?: string): Promise<DeliveryReport> {
    const response = await this.get<{ data: DeliveryReport }>('orders/reports/delivery', undefined, {
      params: { startDate, endDate, deliveryPersonId: personId }
    })
    return response.data.data
  }

  async deletePerson(id: string): Promise<void> {
    await this.post(`delivery-personnel/${id}/delete`, {})
  }
}

export const deliveryService = new DeliveryService()
