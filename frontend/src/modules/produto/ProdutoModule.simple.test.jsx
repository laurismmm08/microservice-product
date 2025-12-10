import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProdutoModule from './ProdutoModule';

describe('ProdutoModule - Testes Simples', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('deve mostrar loading inicial', async () => {
    // Mock que resolve imediatamente
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
    
    // Loading deve aparecer imediatamente
    expect(screen.getByText(/carregando produtos/i)).toBeInTheDocument();
    
    // Aguardar loading desaparecer
    await waitFor(() => {
      expect(screen.queryByText(/carregando produtos/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('deve mostrar produtos após carregar', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { idProduct: 1, description: 'Produto Teste', price: 100, active: true }
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

    render(<ProdutoModule />);
    
    // Primeiro loading
    expect(screen.getByText(/carregando produtos/i)).toBeInTheDocument();
    
    // Depois produtos
    await waitFor(() => {
      expect(screen.getByText('Produto Teste')).toBeInTheDocument();
      expect(screen.getByText('R$ 100,00')).toBeInTheDocument();
      expect(screen.getByText('Ativo')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('deve mostrar erro quando fetch falha', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Falha na rede'));

    render(<ProdutoModule />);
    
    await waitFor(() => {
      expect(screen.getByText(/erro ao carregar produtos/i)).toBeInTheDocument();
      expect(screen.getByText(/tentar novamente/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('deve mostrar mensagem quando não há produtos', async () => {
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
});
