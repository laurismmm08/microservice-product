import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Pagination } from '../../components/ui/pagination';
import './ProdutoModule.css';

// Configuração
const API_CONFIG = {
  CATALOG_API: 'http://localhost:3001',
  TIMEOUT: 5000,
  USE_CLIENT_PAGINATION: true // API não tem paginação, fazemos no frontend
};

function ProdutoModule() {
  // Estado para todos os produtos (carregados uma vez)
  const [allProducts, setAllProducts] = useState([]);
  // Estado para produtos da página atual
  const [currentProducts, setCurrentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Calcular produtos da página atual
  const calculateCurrentProducts = useCallback((allProducts, page, limit) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return allProducts.slice(startIndex, endIndex);
  }, []);

  // Carregar todos os produtos da API
  const fetchAllProducts = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError('');
      
      const url = `${API_CONFIG.CATALOG_API}/products`;
      console.log('🔍 Buscando produtos de:', url);
      
      const options = {
        signal: abortControllerRef.current.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      };
      
      const response = await Promise.race([
        fetch(url, options),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout excedido')), API_CONFIG.TIMEOUT)
        )
      ]);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 Produtos recebidos:', data.length);
      
      if (!isMountedRef.current) return;
      
      if (!Array.isArray(data)) {
        throw new Error('Formato de resposta inválido - esperado array');
      }
      
      // Adicionar campos adicionais para demonstração
      const enhancedData = data.map((product, index) => ({
        ...product,
        active: index % 4 !== 0, // 75% ativos, 25% inativos
        category: ['Eletrônicos', 'Informática', 'Acessórios'][index % 3],
        stock: Math.floor(Math.random() * 100) + 10,
        dimensions: {
          width: Math.floor(Math.random() * 50) + 10,
          height: Math.floor(Math.random() * 30) + 5,
          length: Math.floor(Math.random() * 40) + 15,
          weight: parseFloat((Math.random() * 5 + 0.5).toFixed(2))
        }
      }));
      
      setAllProducts(enhancedData);
      
      // Calcular paginação inicial
      const total = enhancedData.length;
      const totalPages = Math.ceil(total / pagination.limit);
      const currentPageProducts = calculateCurrentProducts(enhancedData, pagination.page, pagination.limit);
      
      setCurrentProducts(currentPageProducts);
      setPagination(prev => ({
        ...prev,
        total,
        totalPages,
        hasNextPage: prev.page < totalPages,
        hasPreviousPage: prev.page > 1
      }));
      
    } catch (err) {
      if (!isMountedRef.current) return;
      
      if (err.name === 'AbortError') {
        console.log('Requisição cancelada');
        return;
      }
      
      console.error('❌ Erro ao carregar produtos:', err.message);
      setError(`Não foi possível conectar ao servidor (${err.message}). Verifique se o microsserviço Catalog está rodando na porta 3001.`);
      
      // Dados de fallback para demonstração
      const demoData = Array.from({ length: 48 }, (_, i) => ({
        idProduct: i + 1,
        description: `Produto de Demonstração ${i + 1}`,
        price: (i + 1) * 10,
        active: i % 4 !== 0,
        category: ['Eletrônicos', 'Informática', 'Acessórios'][i % 3],
        stock: Math.floor(Math.random() * 100) + 10,
        dimensions: {
          width: Math.floor(Math.random() * 50) + 10,
          height: Math.floor(Math.random() * 30) + 5,
          length: Math.floor(Math.random() * 40) + 15,
          weight: parseFloat((Math.random() * 5 + 0.5).toFixed(2))
        }
      }));
      
      setAllProducts(demoData);
      const currentPageProducts = calculateCurrentProducts(demoData, pagination.page, pagination.limit);
      setCurrentProducts(currentPageProducts);
      setPagination(prev => ({
        ...prev,
        total: demoData.length,
        totalPages: Math.ceil(demoData.length / prev.limit),
        hasNextPage: prev.page < Math.ceil(demoData.length / prev.limit),
        hasPreviousPage: prev.page > 1
      }));
      
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [pagination.page, pagination.limit, calculateCurrentProducts]);

  // Atualizar produtos da página quando paginação mudar
  useEffect(() => {
    if (allProducts.length > 0) {
      const currentPageProducts = calculateCurrentProducts(allProducts, pagination.page, pagination.limit);
      setCurrentProducts(currentPageProducts);
      setPagination(prev => ({
        ...prev,
        hasNextPage: prev.page < Math.ceil(allProducts.length / prev.limit),
        hasPreviousPage: prev.page > 1
      }));
    }
  }, [pagination.page, pagination.limit, allProducts, calculateCurrentProducts]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchAllProducts();
    
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAllProducts]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleItemsPerPageChange = (newLimit) => {
    setPagination(prev => ({
      ...prev,
      limit: newLimit,
      page: 1, // Reset para primeira página
      totalPages: Math.ceil(prev.total / newLimit)
    }));
  };

  const formatPrice = (price) => {
    const numericPrice = typeof price === 'number' ? price : parseFloat(price) || 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericPrice);
  };

  const formatDimensions = (dimensions) => {
    if (!dimensions) return 'N/A';
    return `${dimensions.width}×${dimensions.height}×${dimensions.length}cm`;
  };

  if (loading) {
    return (
      <div className="produto-module">
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full opacity-20"></div>
            </div>
          </div>
          <h2 className="mt-8 text-2xl font-semibold text-gray-800">Carregando Catálogo</h2>
          <p className="mt-3 text-gray-600 text-center max-w-md">
            Conectando ao microsserviço de produtos...
          </p>
          <div className="mt-6 flex items-center space-x-2 text-sm text-gray-500">
            <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>Buscando produtos de http://localhost:3001/products</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="produto-module">
      {/* Cabeçalho */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Catálogo de Produtos</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="text-gray-600">
                Sistema de gerenciamento de produtos com paginação
              </p>
              {error ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Modo demonstração
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Conectado à API
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="flex items-center space-x-4">
              <div className="text-sm bg-gray-50 px-3 py-2 rounded-lg">
                <span className="font-semibold text-gray-700">{pagination.total}</span>
                <span className="text-gray-500"> produtos • </span>
                <span className="font-semibold text-gray-700">Página {pagination.page}</span>
                <span className="text-gray-500">/{pagination.totalPages}</span>
              </div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erro de conexão</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                  <p className="mt-1 text-xs">
                    Verifique se o microsserviço Catalog está rodando:
                    <code className="ml-1 px-1.5 py-0.5 bg-red-100 rounded">npm run start:sqlite</code>
                  </p>
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => {
                      setError('');
                      fetchAllProducts();
                    }}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Tentar novamente
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-lg font-medium text-gray-900">Lista de Produtos</h2>
            <p className="text-sm text-gray-500">
              Mostrando {currentProducts.length} de {pagination.total} produtos
              {pagination.total > 0 && ` (${Math.ceil((pagination.page / pagination.totalPages) * 100)}% do catálogo)`}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <label htmlFor="items-per-page" className="text-sm text-gray-600 mr-2">
                Itens por página:
              </label>
              <select
                id="items-per-page"
                value={pagination.limit}
                onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                className="block w-24 rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estoque
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dimensões
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto encontrado</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Tente ajustar os filtros ou recarregar a página.
                    </p>
                  </td>
                </tr>
              ) : (
                currentProducts.map((product) => (
                  <tr 
                    key={product.idProduct} 
                    className="hover:bg-gray-50 transition-colors duration-150"
                    data-testid={`product-row-${product.idProduct}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded inline-block">
                        #{product.idProduct}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">{product.description}</div>
                      {product.category && (
                        <div className="text-xs text-gray-500 mt-1">
                          {product.category}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-blue-600">
                        {formatPrice(product.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.active ? (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Ativo
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            Inativo
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-24 h-2 bg-gray-200 rounded-full overflow-hidden ${product.stock > 0 ? '' : 'opacity-50'}`}>
                          <div 
                            className={`h-full ${product.stock > 50 ? 'bg-green-500' : product.stock > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(product.stock, 100)}%` }}
                          ></div>
                        </div>
                        <span className={`ml-3 text-sm font-medium ${product.stock > 50 ? 'text-green-600' : product.stock > 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {product.stock}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.dimensions ? (
                        <div className="font-mono">
                          {formatDimensions(product.dimensions)}
                          <div className="text-xs text-gray-400">
                            {product.dimensions.weight}kg
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            showInfo={true}
            showPageNumbers={true}
            showItemsPerPage={false}
          />
          
          {/* Informações da paginação */}
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>
              Mostrando produtos {(pagination.page - 1) * pagination.limit + 1} a{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
            </p>
            <p className="mt-1 text-xs">
              Paginação realizada no cliente (API retorna todos os produtos de uma vez)
            </p>
          </div>
        </div>
      )}

      {/* Informações do sistema */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between text-sm text-gray-500">
          <div>
            <p>
              <span className="font-medium">Backend:</span> Catalog API (Node.js/TypeScript)
            </p>
            <p className="mt-1">
              <span className="font-medium">Endpoint:</span>{' '}
              <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                GET {API_CONFIG.CATALOG_API}/products
              </code>
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <p>
              <span className="font-medium">Status:</span>{' '}
              {error ? (
                <span className="text-red-600">Conexão falhou - usando dados locais</span>
              ) : (
                <span className="text-green-600">Conectado à API remota</span>
              )}
            </p>
            <p className="mt-1">
              <span className="font-medium">Produtos carregados:</span> {allProducts.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProdutoModule;
