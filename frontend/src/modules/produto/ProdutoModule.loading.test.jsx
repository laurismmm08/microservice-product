import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProdutoModule from './ProdutoModule';

describe('ProdutoModule - Loading State', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('deve exibir mensagem de carregamento imediatamente após renderizar', async () => {
    // Mock do fetch que não resolve imediatamente
    let resolvePromise;
    const mockPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    global.fetch = vi.fn().mockReturnValue(mockPromise);

    await act(async () => {
      render(<ProdutoModule />);
    });

    // Imediatamente após renderizar, deve mostrar carregando
    expect(screen.getByText(/carregando produtos/i)).toBeInTheDocument();
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();

    // Resolver a promise para evitar warnings
    await act(async () => {
      resolvePromise({
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
    });
  });

  it('deve esconder mensagem de carregamento após dados carregados', async () => {
    global.fetch = vi.fn().mockResolvedValue({
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

    await act(async () => {
      render(<ProdutoModule />);
    });

    // Aguardar os dados carregarem
    await screen.findByText('Product 1');

    // Verificar que loading não está mais visível
    expect(screen.queryByText(/carregando produtos/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
  });

  it('deve mostrar loading ao recarregar após erro', async () => {
    const mockFetch = vi.fn()
      .mockRejectedValueOnce(new Error('Erro de rede'))
      .mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
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
          }, 100);
        });
      });

    global.fetch = mockFetch;

    await act(async () => {
      render(<ProdutoModule />);
    });

    // Aguardar erro aparecer
    await screen.findByText(/erro ao carregar produtos/i);

    // Clicar no botão de tentar novamente
    const retryButton = screen.getByText(/tentar novamente/i);
    
    await act(async () => {
      retryButton.click();
    });

    // Deve mostrar loading novamente
    expect(screen.getByText(/carregando produtos/i)).toBeInTheDocument();
  });
});
