import csv
import pandas as pd
from jobspy import scrape_jobs

def buscar_vagas():
    print("🔍 Iniciando a busca automatizada de vagas...")

    # Termos de busca focados na sua stack (Python, Odoo, Backend, IA)
    cargos = [
        "Desenvolvedor Python",
        "Odoo Developer",
        "Python Junior",
        "Backend Python",
        "Desenvolvedor Odoo",
        "Desenvolvedor PHP",
        "Automação Python"
    ]
    
    todas_vagas = []

    for cargo in cargos:
        print(f"🔎 Pesquisando por: {cargo}...")
        try:
            # Scrape concorrente no LinkedIn, Indeed e Glassdoor
            jobs = scrape_jobs(
                site_name=["linkedin", "indeed", "glassdoor"],
                search_term=cargo,
                location="Brazil",
                results_wanted=15,          # Quantidade de vagas por termo
                hours_old=168,               # Vagas publicadas nos últimos 7 dias (168 horas)
                country_indeed='Brazil',
                is_remote=True               # Filtro para vagas 100% remotas
            )
            
            if not jobs.empty:
                todas_vagas.append(jobs)
                print(f"✅ Encontradas {len(jobs)} vagas para '{cargo}'.")
            else:
                print(f"⚠️ Nenhuma vaga encontrada para '{cargo}'.")

        except Exception as e:
            print(f"❌ Erro ao buscar '{cargo}': {e}")

    # Unificar e exportar os resultados
    if todas_vagas:
        resultado_final = pd.concat(todas_vagas, ignore_index=True)

        # Remover duplicadas caso a mesma vaga apareça em buscas diferentes
        resultado_final.drop_duplicates(subset=['job_url'], inplace=True)

        # Selecionar colunas mais relevantes para a análise
        colunas_interesse = [
            'site', 'title', 'company', 'location', 
            'date_posted', 'job_url', 'is_remote', 'description'
        ]
        
        # Filtrar colunas existentes
        colunas_presentes = [c for c in colunas_interesse if c in resultado_final.columns]
        df_filtrado = resultado_final[colunas_presentes]

        # Salvar em CSV
        nome_arquivo = "vagas_python_odoo_remoto.csv"
        df_filtrado.to_csv(nome_arquivo, index=False, encoding='utf-8-sig')

        print(f"\n🎉 Busca concluída com sucesso!")
        print(f"📊 Total de vagas únicas coletadas: {len(df_filtrado)}")
        print(f"💾 Resultados salvos no arquivo: {nome_arquivo}")

        # Exibir as 5 primeiras vagas no terminal
        print("\n--- PRIMEIRO IMPACTO DA LISTA ---")
        print(df_filtrado[['site', 'title', 'company', 'job_url']].head())

    else:
        print("\nNenhuma vaga foi encontrada nos critérios especificados.")

if __name__ == "__main__":
    buscar_vagas()
