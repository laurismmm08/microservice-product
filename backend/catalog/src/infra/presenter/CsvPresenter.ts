import Presenter from "./Presenter";

export default class CsvPresenter implements Presenter {
    present(data: any): any {
        // Se for formato paginado, extrai apenas os dados para CSV
        const items = data.data || data;
        
        if (!Array.isArray(items) || items.length === 0) {
            return "";
        }
        
        const headers = Object.keys(items[0]);
        const csvRows = [];
        
        // Adiciona cabeçalhos
        csvRows.push(headers.join(","));
        
        // Adiciona linhas
        for (const item of items) {
            const values = headers.map(header => {
                const value = item[header];
                // Escapa vírgulas e aspas
                const escaped = String(value).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(","));
        }
        
        return csvRows.join("\n");
    }
}
