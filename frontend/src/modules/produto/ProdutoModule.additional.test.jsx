import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProdutoModule from './ProdutoModule';

describe('ProdutoModule - Testes Adicionais', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('deve lidar com resposta vazia do servidor', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}), // Resposta vazia
    });

    await act(async () => {
      render(<ProdutoModule />);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/nenhum produto encontrado/i)).toBeInTheDocument();
    });
  });

  it('deve lidar com erro HTTP 500', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    await act(async () => {
      render(<ProdutoModule />);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/erro ao carregar produtos/i)).toBeInTheDocument();
    });
  });

  it('deve lidar com erro de rede', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await act(async () => {
      render(<ProdutoModule />);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/erro ao carregar produtos/i)).toBeInTheDocument();
    });
  });

  it('deve atualizar produtos ao mudar limite por página', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ idProduct: 1, description: 'Product 1', price: 10, active: true }],
        pagination: {
          page: 1,
          limit: 5,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      }),
    });
    global.fetch = mockFetch;

    await act(async () => {
      render(<ProdutoModule />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    // Simular mudança de limite por página
    const select = screen.getByLabelText(/itens por página:/i);
    await act(async () => {
      fireEvent.change(select, { target: { value: '5' } });
    });

    // Verificar se fetch foi chamado com novo limite
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/products?page=1&limit=5'
    );
  });

  it('deve exibir produtos inativos com classe CSS correta', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { idProduct: 1, description: 'Product 1', price: 10, active: false }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      }),
    });

    await act(async () => {
      render(<ProdutoModule />);
    });
    
    await waitFor(() => {
      const statusElement = screen.getByText('Inativo');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement.className).toContain('bg-red-100');
      expect(statusElement.className).toContain('text-red-800');
    });
  });

  it('deve exibir produtos ativos com classe CSS correta', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { idProduct: 1, description: 'Product 1', price: 10, active: true }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      }),
    });

    await act(async () => {
      render(<ProdutoModule />);
    });
    
    await waitFor(() => {
      const statusElement = screen.getByText('Ativo');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement.className).toContain('bg-green-100');
      expect(statusElement.className).toContain('text-green-800');
    });
  });

  it('deve formatar preço zero corretamente', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { idProduct: 1, description: 'Product 1', price: 0, active: true }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      }),
    });

    await act(async () => {
      render(<ProdutoModule />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('R$ 0,00')).toBeInTheDocument();
    });
  });

  it('deve lidar com preço não numérico', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { idProduct: 1, description: 'Product 1', price: 'invalid', active: true }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      }),
    });

    await act(async () => {
      render(<ProdutoModule />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('R$ 0,00')).toBeInTheDocument();
    });
  });

  it('não deve chamar fetch ao clicar em página desabilitada', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ idProduct: 1, description: 'Product 1', price: 10, active: true }],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      }),
    });
    global.fetch = mockFetch;

    await act(async () => {
      render(<ProdutoModule />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    // Tentar clicar no botão de página anterior (deve estar desabilitado)
    const prevButton = screen.getByLabelText(/página anterior/i);
    expect(prevButton.disabled).toBe(true);
    
    await act(async () => {
      fireEvent.click(prevButton);
    });

    // fetch não deve ser chamado novamente
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
