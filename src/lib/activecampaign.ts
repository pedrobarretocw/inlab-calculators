/**
 * ActiveCampaign API Integration Service
 * 
 * Serviço reutilizável para integração com ActiveCampaign
 * Baseado na documentação oficial: https://developers.activecampaign.com/reference/
 */

// Verificar se estamos no lado do servidor (onde as env vars estão disponíveis)
if (typeof window !== 'undefined') {
  throw new Error('ActiveCampaign service deve ser usado apenas no servidor')
}

const ACTIVECAMPAIGN_API_KEY = process.env.ACTIVECAMPAIGN_API_KEY
const ACTIVECAMPAIGN_BASE_URL = process.env.ACTIVECAMPAIGN_BASE_URL

if (!ACTIVECAMPAIGN_API_KEY || !ACTIVECAMPAIGN_BASE_URL) {
  console.error('[ActiveCampaign] Credenciais não encontradas!')
  console.error('[ActiveCampaign] API_KEY exists:', !!ACTIVECAMPAIGN_API_KEY)
  console.error('[ActiveCampaign] BASE_URL exists:', !!ACTIVECAMPAIGN_BASE_URL)
  console.error('[ActiveCampaign] Env vars disponíveis:', Object.keys(process.env).filter(key => key.includes('ACTIVE')))
  throw new Error('ActiveCampaign credentials not found in environment variables')
}

interface ContactData {
  email: string
  firstName?: string
  lastName?: string
  phone?: string
}

interface ActiveCampaignContact {
  id: string
  email: string
  firstName: string
  lastName: string
  cdate: string
  udate: string
}

interface CreateContactResponse {
  contact: ActiveCampaignContact
}

// Removed AddToListResponse (unused)

/**
 * Classe para interação com a API do ActiveCampaign
 */
export class ActiveCampaignService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = ACTIVECAMPAIGN_API_KEY!
    this.baseUrl = ACTIVECAMPAIGN_BASE_URL!
  }

  /**
   * Headers padrão para requisições à API
   */
  private getHeaders(): HeadersInit {
    return {
      'Api-Token': this.apiKey,
      'Content-Type': 'application/json',
    }
  }

  /**
   * Busca um contato pelo email
   */
  async findContactByEmail(email: string): Promise<ActiveCampaignContact | null> {
    try {
      const url = `${this.baseUrl}/api/3/contacts?email=${encodeURIComponent(email)}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        console.warn(`[ActiveCampaign] Erro ao buscar contato: ${response.status}`)
        return null
      }

      const data = await response.json()
      
      if (data.contacts && data.contacts.length > 0) {
        return data.contacts[0]
      }

      return null
    } catch (error) {
      console.error('[ActiveCampaign] Erro ao buscar contato:', error)
      return null
    }
  }

  /**
   * Cria um novo contato no ActiveCampaign
   */
  async createContact(contactData: ContactData): Promise<ActiveCampaignContact | null> {
    try {
      const url = `${this.baseUrl}/api/3/contacts`
      
      const payload = {
        contact: {
          email: contactData.email,
          firstName: contactData.firstName || '',
          lastName: contactData.lastName || '',
          phone: contactData.phone || '',
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[ActiveCampaign] Erro ao criar contato: ${response.status}`, errorText)
        return null
      }

      const data: CreateContactResponse = await response.json()
      return data.contact
    } catch (error) {
      console.error('[ActiveCampaign] Erro ao criar contato:', error)
      return null
    }
  }

  /**
   * Atualiza um contato existente
   */
  async updateContact(contactId: string, contactData: Partial<ContactData>): Promise<ActiveCampaignContact | null> {
    try {
      const url = `${this.baseUrl}/api/3/contacts/${contactId}`
      
      const payload = {
        contact: {
          email: contactData.email,
          firstName: contactData.firstName,
          lastName: contactData.lastName,
          phone: contactData.phone,
        }
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[ActiveCampaign] Erro ao atualizar contato: ${response.status}`, errorText)
        return null
      }

      const data: CreateContactResponse = await response.json()
      return data.contact
    } catch (error) {
      console.error('[ActiveCampaign] Erro ao atualizar contato:', error)
      return null
    }
  }

  /**
   * Adiciona um contato a uma lista específica
   */
  async addContactToList(contactId: string, listId: number): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/api/3/contactLists`
      
      const payload = {
        contactList: {
          list: listId,
          contact: contactId,
          status: 1, // 1 = active (subscribed), 2 = unsubscribed
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[ActiveCampaign] Erro ao adicionar contato à lista: ${response.status}`, errorText)
        return false
      }

      await response.json()
      return true
    } catch (error) {
      console.error('[ActiveCampaign] Erro ao adicionar contato à lista:', error)
      return false
    }
  }

  /**
   * Função principal: Cria ou atualiza contato e o adiciona a uma lista
   * Esta é a função que deve ser usada na maioria dos casos
   */
  async subscribeContactToList(
    contactData: ContactData, 
    listId: number = 15
  ): Promise<{ success: boolean; contactId?: string; message?: string }> {
    try {
      
      // 1. Verificar se o contato já existe
      let contact = await this.findContactByEmail(contactData.email)
      
      if (contact) {
        
        // Atualizar dados se necessário
        if (contactData.firstName || contactData.lastName || contactData.phone) {
          contact = await this.updateContact(contact.id, contactData)
          if (!contact) {
            return { success: false, message: 'Erro ao atualizar contato existente' }
          }
        }
      } else {
        // 2. Criar novo contato
        contact = await this.createContact(contactData)
        
        if (!contact) {
          return { success: false, message: 'Erro ao criar contato' }
        }
      }

      // 3. Adicionar à lista
      const addedToList = await this.addContactToList(contact.id, listId)
      
      if (!addedToList) {
        return { 
          success: false, 
          contactId: contact.id,
          message: 'Contato criado, mas falha ao adicionar à lista' 
        }
      }

      return { 
        success: true, 
        contactId: contact.id,
        message: 'Contato processado e adicionado à lista com sucesso' 
      }
    } catch (error) {
      console.error('[ActiveCampaign] Erro geral:', error)
      return { 
        success: false, 
        message: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      }
    }
  }
}

/**
 * Instância singleton do serviço ActiveCampaign
 */
export const activeCampaignService = new ActiveCampaignService()

/**
 * Função de conveniência para adicionar contato à lista padrão (15)
 */
export async function addEmailToActiveCampaign(
  email: string, 
  firstName?: string, 
  lastName?: string,
  phone?: string
): Promise<{ success: boolean; contactId?: string; message?: string }> {
  return activeCampaignService.subscribeContactToList(
    { email, firstName, lastName, phone },
    15 // Lista padrão ID 15
  )
}
