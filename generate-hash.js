const bcrypt = require('bcryptjs');

async function generateHash() {
    const password = '12345';
    const rounds = 10;
    
    const hash = await bcrypt.hash(password, rounds);
    
    console.log('='.repeat(80));
    console.log('HASH GENERADO PARA LA CONTRASEÑA: 12345');
    console.log('='.repeat(80));
    console.log('Hash bcrypt:', hash);
    console.log('='.repeat(80));
    console.log('\nVerificación:');
    
    // Verificar que el hash funciona
    const isValid = await bcrypt.compare('12345', hash);
    console.log('¿El hash es válido?', isValid ? '✅ SÍ' : '❌ NO');
    console.log('\nPuedes usar este hash en tu SQL:');
    console.log(`'${hash}'`);
}

generateHash();
