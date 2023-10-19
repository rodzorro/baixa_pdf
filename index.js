const fs      = require('fs');
const https   = require('https');
const pdf     = require('pdf-parse');
const cheerio = require('cheerio');
const path    = require('path');

const url = 'https://www.ourinhos.sp.gov.br/portal/diario-oficial';

    https.get(url, (response) => {
        let dados = '';
        
        response.on('data', (chunk) => {
            dados += chunk;
        });

        response.on('end', () => {
            const $ = cheerio.load(dados);
            
            const div_download = $('.dof_links_edicao');        
            const div_edicao = $('.dof_info_edicao:first');
            let edicao = div_edicao.find('span').text();            

            const existe_edicao = verifica_existe_edicao(edicao);                        
            
            if  (existe_edicao === 0){

                div_download.find('a[href]').each(async (index, element) => {
                const href = $(element).attr('href');   

                    if (href.includes('download')){
                        const link = 'https://www.ourinhos.sp.gov.br' + href;
                        console.log(link);                    
                        pega_link_pdf(link,edicao);                                      
                    }                
                });  
            }          
        });                    
    });

 function pega_link_pdf(link,edicao){

    https.get(link,  function (response) {        
        
        let data =  '';
        response.on('data',  (chunk) => {
            data += chunk;
        });
        response.on('end', () => {            
                   
            IndiceInicio = data.indexOf('url')+4;
            IndiceFim    = data.indexOf('pdf')+3;                        
            console.log(data);  
            baixa_pdf('https://www.ourinhos.sp.gov.br' + data.slice(IndiceInicio,IndiceFim),edicao) ;
        });        
    });
}

function baixa_pdf(url_pdf,edicao){
    const arquivoLocal = fs.createWriteStream(edicao.slice(3)+'.pdf', { encoding: 'utf8' });    

    https.get(url_pdf,function (response) {
        response.pipe(arquivoLocal);

        arquivoLocal.on('finish',function () {
            arquivoLocal.close;
            procura_pdf(edicao);
        });
    });
}

async function procura_pdf(edicao){
    try{

        const dataBuffer = fs.readFileSync(edicao.slice(3)+'.pdf');
        console.log(edicao+'.pdf');        
        const data = await pdf(dataBuffer);    
                        
        if (data.text.toUpperCase().includes('RODRIGO AQUINO')) {
            console.log('Seu nome ESTÁ neste edital');
        }else{
            console.log('Seu nome NÃO ESTÁ neste edital');
        }

    }catch(error){
        console.log('errao :',error);
    }    

}

function verifica_existe_edicao(edicao){
    if (fs.existsSync(edicao.slice(3)+'.pdf'))        {
        console.log('Esta edicao já foi baixada.');        
        procura_pdf(edicao);
    }else {
        exclui_pdf();        
        return 0;
    }
}

function exclui_pdf(){
    
    const dir =   process.cwd();    
    const arquivos =  fs.readdirSync(dir,'utf-8');
    
    for (const arquivo of arquivos){
        if (path.extname(arquivo) === '.pdf'){
            fs.unlinkSync(arquivo);
        }
    }    
}
