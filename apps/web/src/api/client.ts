import type {
  AnyMachine,
  SavedMachineEntity,
  ConversionRequest,
  ConversionResponse,
  SimulationRequest,
  SimulationResponse,
  EquivalenceResponse,
} from '@automatalab/contracts';
import type {
  ValidationResult,
  ProductMachineEquivalenceResult,
} from '@automatalab/automata';

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  uptime: number;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error: ApiError = {
      error: body.error || `HTTP ${res.status} ${res.statusText}`,
      code: body.code || 'API_ERROR',
      details: body.details,
    };
    throw error;
  }

  return body;
}

export const api = {
  // Health
  async getHealth(): Promise<HealthResponse> {
    return request<HealthResponse>('/api/health');
  },

  // Machines
  async listMachines(type?: 'mealy' | 'moore'): Promise<SavedMachineEntity[]> {
    const query = type ? `?type=${type}` : '';
    const response = await request<{ data: SavedMachineEntity[] }>(`/api/machines${query}`);
    return response.data || [];
  },

  async getMachine(id: string): Promise<SavedMachineEntity> {
    const response = await request<{ data: SavedMachineEntity }>(`/api/machines/${encodeURIComponent(id)}`);
    return response.data;
  },

  async createMachine(machine: AnyMachine): Promise<SavedMachineEntity> {
    const response = await request<{ data: SavedMachineEntity }>('/api/machines', {
      method: 'POST',
      body: JSON.stringify(machine),
    });
    return response.data;
  },

  async updateMachine(id: string, machine: AnyMachine): Promise<SavedMachineEntity> {
    const response = await request<{ data: SavedMachineEntity }>(`/api/machines/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(machine),
    });
    return response.data;
  },

  async deleteMachine(id: string): Promise<{ success: boolean; message?: string }> {
    return request<{ success: boolean; message?: string }>(`/api/machines/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  // Conversions
  async convertMachine(payload: ConversionRequest): Promise<ConversionResponse> {
    const response = await request<{ data: ConversionResponse }>('/api/conversions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  // Simulations
  async simulateMachine(payload: SimulationRequest): Promise<SimulationResponse> {
    const response = await request<{ data: SimulationResponse }>('/api/simulations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  // Validation
  async validateMachine(machine: AnyMachine): Promise<ValidationResult> {
    const response = await request<{ data: ValidationResult }>('/api/validations', {
      method: 'POST',
      body: JSON.stringify(machine),
    });
    return response.data;
  },

  // Equivalence
  async verifyEquivalence(machineA: AnyMachine, machineB: AnyMachine, maxDepth = 10): Promise<EquivalenceResponse | ProductMachineEquivalenceResult> {
    const response = await request<{ data: EquivalenceResponse | ProductMachineEquivalenceResult }>('/api/verify-equivalence', {
      method: 'POST',
      body: JSON.stringify({ machineA, machineB, maxDepth }),
    });
    return response.data;
  },
};
