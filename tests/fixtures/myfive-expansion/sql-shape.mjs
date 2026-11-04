// Fixed local test queries only, never provider/user input. DML CTE must be top-level.
export function aggregateSelect(query) {
 if(!/^select\s/i.test(query.trim()))throw Error('Expected SELECT-only local fixture query');
 return `select coalesce(json_agg(row_to_json(r)),'[]') from (${query}) r`;
}
export function aggregateMutation(statement) {
 if(!/^(update|delete|insert)\s/i.test(statement.trim())||! /\breturning\b/i.test(statement))throw Error('Expected local fixture mutation with RETURNING');
 return `with changed as (${statement}) select coalesce(json_agg(row_to_json(changed)),'[]') from changed`;
}
// PostgreSQL17 catalog columns, verified against installed catalog/pg_database.h.
export const databaseLocaleQuery="select json_build_object('collate',datcollate,'ctype',datctype,'I_dotless','I' ilike 'ı','dotted_i','İ' ilike 'i','accent','É' ilike 'é','emojiLength',char_length(repeat('😀',120))) from pg_catalog.pg_database where datname=current_database();";
