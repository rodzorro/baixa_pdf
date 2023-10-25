const fs      = require('fs');
const pdf     = require('pdf-parse');
const cheerio = require('cheerio');
const axios   = require('axios');

const url = 'https://www.concursosrbo.com.br/Projetos/projeto-detalhes.aspx?id=05nbegfo2nI='; 

async function main() {

  const resp = await axios.get(url);  
  
  const $ = cheerio.load(resp.data);            
  const div_links =  $('#DivLinks1 li');  
  const links = div_links.find('a');

  for (let i=0;i<links.length;i++){
    const nome = links[i];
        
    console.log($(nome).text())
    //console.log('https://www.concursosrbo.com.br' + $(nome).attr('href'));   

    await baixa_pdf('https://www.concursosrbo.com.br'+ $(nome).attr('href'),i+1);

    await procura_pdf(i+1);
    
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
