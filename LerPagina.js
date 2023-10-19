const https = require('https');

url = 'https://www.ourinhos.sp.gov.br/portal/diario-oficial';

https.get(url, (res) => {  

    let dados = ''    ;
  res.on('data', (d) => {
    dados += d;
  });

  res.on('end', () => {
    console.log(dados);
  });

}).on('error', (e) => {
  console.error(e);
});