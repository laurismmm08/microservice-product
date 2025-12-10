import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProdutoModule from './ProdutoModule';

describe('ProdutoModule - Testes Abrangentes', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  describe('Fluxo de Carregamento', () => {
    it('deve exibir loading, depois produtos, depois paginação', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [
            { idProduct: 1, description: 'Produto A', price: 100, active: true },
            { idProduct: 2, description: 'Produto B', price: 200, active: false }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false
          }
        }),
      });

      render(<ProdutoModule />);
      
      // 1. Estado de loading
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      expect(screen.getByText(/carregando produtos/i)).toBeInTheDocument();
      
      // 2. Produtos carregados
      await waitFor(() => {
        expect(screen.getByText('Produto A')).toBeInTheDocument();
        expect(screen.getByText('Produto B')).toBeInTheDocument();
        expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
      });
      
      // 3. Paginação visível
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
      expect(screen.getByText(/página 1 de 1/i)).toBeInTheDocument();
    });

    it('deve exibir loading, depois mensagem de sem produtos', async () => {
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
      
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByTestId('no-products-message')).toBeInTheDocument();
        expect(screen.getByText(/nenhum produto encontrado/i)).toBeInTheDocument();
        expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
      });
    });

    it('deve exibir loading, depois erro, permitir retry', async () => {
      const mockFetch = vi.fn()
        .mockRejectedValueOnce(new Error('Falha na rede'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [{ idProduct: 1, description: 'Produto Recuperado', price: 50, active: true }],
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

      render(<ProdutoModule />);
      
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      
      // Primeiro erro
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText(/erro ao carregar produtos/i)).toBeInTheDocument();
        expect(screen.getByTestId('retry-button')).toBeInTheDocument();
      });
      
      // Clicar para tentar novamente
      fireEvent.click(screen.getByTestId('retry-button'));
      
      // Deve mostrar loading novamente
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      
      // Depois produto recuperado
      await waitFor(() => {
        expect(screen.getByText('Produto Recuperado')).toBeInTheDocument();
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      });
    });
  });

  describe('Formatação e Apresentação', () => {
    it('deve formatar diferentes valores monetários', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [
            { idProduct: 1, description: 'Produto 1', price: 0, active: true },
            { idProduct: 2, description: 'Produto 2', price: 10.5, active: true },
            { idProduct: 3, description: 'Produto 3', price: 1000, active: true },
            { idProduct: 4, description: 'Produto 4', price: 99.99, active: true }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 4,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false
          }
        }),
      });

      render(<ProdutoModule />);
      
      await waitFor(() => {
        expect(screen.getByText('R$ 0,00')).toBeInTheDocument();
        expect(screen.getByText('R$ 10,50')).toBeInTheDocument();
        expect(screen.getByText('R$ 1.000,00')).toBeInTheDocument();
        expect(screen.getByText('R$ 99,99')).toBeInTheDocument();
      });
    });

    it('deve lidar com preços inválidos', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [
            { idProduct: 1, description: 'Produto 1', price: null, active: true },
            { idProduct: 2, description: 'Produto 2', price: 'invalid', active: true },
            { idProduct: 3, description: 'Produto 3', price: undefined, active: true }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 3,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false
          }
        }),
      });

      render(<ProdutoModule />);
      
      await waitFor(() => {
        // Todos devem mostrar R$ 0,00 para preços inválidos
        const zeroPrices = screen.getAllByText('R$ 0,00');
        expect(zeroPrices.length).toBe(3);
      });
    });
  });

  describe('Paginação', () => {
    it('deve mudar itens por página corretamente', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: Array.from({ length: 20 }, (_, i) => ({
              idProduct: i + 1,
              description: `Produto ${i + 1}`,
              price: (i + 1) * 10,
              active: true
            })),
            pagination: {
              page: 1,
              limit: 10,
              total: 100,
              totalPages: 10,
              hasNextPage: true,
              hasPreviousPage: false
            }
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: Array.from({ length: 5 }, (_, i) => ({
              idProduct: i + 1,
              description: `Produto ${i + 1}`,
              price: (i + 1) * 10,
              active: true
            })),
            pagination: {
              page: 1,
              limit: 5,
              total: 100,
              totalPages: 20,
              hasNextPage: true,
              hasPreviousPage: false
            }
          }),
        });

      global.fetch = mockFetch;

      render(<ProdutoModule />);
      
      await waitFor(() => {
        expect(screen.getByText(/mostrando 1 a 10 de 100 produtos/i)).toBeInTheDocument();
      });
      
      // Mudar para 5 itens por página
      const select = screen.getByTestId('items-per-page-select');
      fireEvent.change(select, { target: { value: '5' } });
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
        expect(mockFetch).toHaveBeenLastCalledWith(
          'http://localhost:8080/products?page=1&limit=5'
        );
        expect(screen.getByText(/mostrando 1 a 5 de 100 produtos/i)).toBeInTheDocument();
      });
    });
  });

  describe('Resiliência', () => {
    it('deve lidar com resposta mal formatada do servidor', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          // Resposta sem a estrutura esperada
          produtos: [], // nome errado do campo
          paginacao: {} // estrutura errada
        }),
      });

      render(<ProdutoModule />);
      
      await waitFor(() => {
        // Deve mostrar mensagem de sem produtos (array vazio)
        expect(screen.getByTestId('no-products-message')).toBeInTheDocument();
      });
    });

    it('deve lidar com erro HTTP 404', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      render(<ProdutoModule />);
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText(/erro ao carregar produtos/i)).toBeInTheDocument();
      });
    });

    it('deve lidar com erro HTTP 500', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      render(<ProdutoModule />);
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
    });
  });
});
