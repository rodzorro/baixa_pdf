const fs      = require('fs');
const pdf     = require('pdf-parse');
const cheerio = require('cheerio');
const axios   = require('axios');

const url = 'https://www.fundacaofafipa.org.br/informacoes/3893/';
          
async function main() {

  let resp = await axios.get(url);  
  
  const $ = cheerio.load(resp.data);  

  const div_links  = $('[class="dados total2"] > ul >  li > a'); 
  const data_links = $('[class="dados total2"] > ul >  li > a > span'); 

  let num_edital = 0;
  let num_anexo = 0;  

  for (let i=0;i<div_links.length;i++){
    let nome = div_links[i];
    let data = data_links[i];
    const pdf = $(nome).attr('href');
        
    let edital = nome_edicao($(nome).text());
    console.log($(data).text());

    if (edital === 'Edital') {
      ++num_edital;
      edital = edital + ' - ' + num_edital
      await baixa_pdf(pdf,edital);
      await procura_pdf(edital);
    }  
    else {
      ++num_anexo;
      edital = edital + ' - ' +  num_anexo
      await baixa_pdf(pdf,edital);
      await procura_pdf(edital);
    }
   
    console.log('*************************************************');
            
  }  
}

main();

async function baixa_pdf(url_pdf,edicao){
      
  if (verifica_existe_edicao(edicao) === 0){    
    console.log('PDF já foi baixado!');
    return;
  }else {
    const resp = await axios.get(url_pdf,{responseType:'stream'});
    const stream = resp.data.pipe(fs.createWriteStream(edicao +'.pdf'));

    return new Promise((resolve, reject) => {
        stream.on('finish', () => {
          console.log('PDF baixado com sucesso!');
          resolve();          
        });        
      });      
    }
    
}

function verifica_existe_edicao(edicao){
  if (fs.existsSync(edicao+'.pdf'))        {      
      return 0;
  }else {      
      return 1;
  }
}

async function procura_pdf(edicao){
  
      const dataBuffer = fs.readFileSync(edicao +'.pdf');
      console.log(edicao+'.pdf');        
      const data = await pdf(dataBuffer);        
                      
      if (data.text.toUpperCase().includes('RODRIGO AQUINO')) {
        //fs.rename(edicao,'SEUNOMEESTAAQUI.pdf' );
          console.log('SEU NOME ESTA NESTE EDITAL');
      }

}

function retira_espaço(nome){
  let novo_nome = '';

  for (let i =0;i < nome.length;i++){
   if (nome[i].trim() !== '' )    {
      novo_nome = novo_nome + nome[i];
    }  
  }  
  
  return novo_nome
}

function nome_edicao(nome){
  
  let novo_nome = nome.trim();
  novo_nome = novo_nome.split(' ');    

  return novo_nome[0];
}