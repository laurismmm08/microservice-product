import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProdutoModule from './ProdutoModule';

const mockPagedResponse = {
  data: [
    { idProduct: 1, description: 'Product 1', price: 10, active: true },
    { idProduct: 2, description: 'Product 2', price: 20, active: true },
    { idProduct: 3, description: 'Product 3', price: 30, active: false },
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 3,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  }
};

describe('ProdutoModule', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('deve exibir produtos após carregamento bem-sucedido', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPagedResponse,
    });

    render(<ProdutoModule />);
    
    // Primeiro deve mostrar carregando
    expect(screen.getByText(/carregando produtos/i)).toBeInTheDocument();
    
    // Depois deve mostrar os produtos
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
      expect(screen.getByText('Product 3')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('deve exibir mensagem de erro quando a requisição falhar', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Erro de rede'));

    render(<ProdutoModule />);
    
    await waitFor(() => {
      expect(screen.getByText(/erro ao carregar produtos/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('deve exibir mensagem quando não há produtos', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        }
      }),
    });

    render(<ProdutoModule />);
    
    await waitFor(() => {
      expect(screen.getByText(/nenhum produto encontrado/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('deve formatar preços corretamente', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPagedResponse,
    });

    render(<ProdutoModule />);
    
    await waitFor(() => {
      expect(screen.getByText('R$ 10,00')).toBeInTheDocument();
      expect(screen.getByText('R$ 20,00')).toBeInTheDocument();
      expect(screen.getByText('R$ 30,00')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('deve exibir status dos produtos corretamente', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPagedResponse,
    });

    render(<ProdutoModule />);
    
    await waitFor(() => {
      const ativoElements = screen.getAllByText('Ativo');
      expect(ativoElements.length).toBe(2);
      
      const inativoElements = screen.getAllByText('Inativo');
      expect(inativoElements.length).toBe(1);
    }, { timeout: 3000 });
  });

  it('deve fazer nova requisição ao mudar itens por página', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPagedResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ idProduct: 4, description: 'Product 4', price: 40, active: true }],
          pagination: {
            page: 1,
            limit: 5,
            total: 4,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false
          }
        }),
      });
    global.fetch = mockFetch;

    render(<ProdutoModule />);
    
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Mudar itens por página
    const select = screen.getByTestId('items-per-page-select');
    fireEvent.change(select, { target: { value: '5' } });

    // Verificar se fetch foi chamado com novo limite
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:8080/products?page=1&limit=5'
      );
    }, { timeout: 3000 });
  });

  it('deve exibir informações de paginação', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPagedResponse,
    });

    render(<ProdutoModule />);
    
    await waitFor(() => {
      expect(screen.getByText(/página 1 de 1/i)).toBeInTheDocument();
      expect(screen.getByText(/mostrando 1 a 3 de 3 produtos/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('deve permitir tentar novamente após erro', async () => {
    const mockFetch = vi.fn()
      .mockRejectedValueOnce(new Error('Erro de rede'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPagedResponse,
      });
    global.fetch = mockFetch;

    render(<ProdutoModule />);
    
    await waitFor(() => {
      expect(screen.getByText(/erro ao carregar produtos/i)).toBeInTheDocument();
      expect(screen.getByText(/tentar novamente/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    const retryButton = screen.getByText(/tentar novamente/i);
    
    fireEvent.click(retryButton);

    // Verifica se fetch foi chamado novamente
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    }, { timeout: 3000 });
  });
});
