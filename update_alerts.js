const fs = require('fs');

const files = [
  'components/join-community-btn.tsx',
  'components/create-community-wizard.tsx',
  'components/suggest-modality-modal.tsx',
  'components/post-card.tsx',
  'components/create-post-box.tsx',
  'components/chat-interface.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Add import if not exists
  if (!content.includes('useModal')) {
    if (content.includes('lucide-react')) {
      content = content.replace(/import {([^}]+)} from 'lucide-react'/, "import { $1 } from 'lucide-react'\nimport { useModal } from '@/components/providers/modal-provider'");
    } else {
      content = content.replace(/import { useState } from 'react'/, "import { useState } from 'react'\nimport { useModal } from '@/components/providers/modal-provider'");
    }
  }

  // Inject useModal hook inside the component
  // Find the first occurrence of `export function` or `export default function`
  content = content.replace(/(export (?:default )?function \w+\([^)]*\)(?:\s*:\s*[^\{]+)?\s*\{)/, "$1\n  const { showAlert } = useModal()");

  // Replace alerts
  // alert('Bem-vindo à comunidade!') -> showAlert('Sucesso', 'Bem-vindo à comunidade!', 'success')
  // alert(`Ocorreu um erro...`) -> showAlert('Erro', `Ocorreu um erro...`, 'error')
  
  content = content.replace(/alert\((['"`])Bem-vindo à comunidade!\1\)/g, "showAlert('Sucesso', 'Bem-vindo à comunidade!', 'success')");
  content = content.replace(/alert\((['"`]?)Por favor, faça login para se juntar à comunidade.\1\)/g, "showAlert('Acesso Restrito', 'Por favor, faça login para se juntar à comunidade.', 'info')");
  content = content.replace(/alert\((`Ocorreu um erro ao tentar aderir: \$\{error\.message \|\| 'Erro desconhecido'}`)\)/g, "showAlert('Erro', $1, 'error')");
  
  content = content.replace(/alert\((['"`])Comunidade criada com sucesso!\1\)/g, "showAlert('Sucesso', 'Comunidade criada com sucesso!', 'success')");
  content = content.replace(/alert\((err\.message \|\| 'Erro ao criar comunidade\.')\)/g, "showAlert('Erro', $1, 'error')");
  
  content = content.replace(/alert\((['"`])Erro ao enviar sugestão\. Tente novamente\.\1\)/g, "showAlert('Erro', 'Erro ao enviar sugestão. Tente novamente.', 'error')");
  
  content = content.replace(/alert\((['"`])Erro ao enviar mensagem\1\)/g, "showAlert('Erro', 'Erro ao enviar mensagem', 'error')");
  
  content = content.replace(/alert\((['"`])Link copiado para a área de transferência!\1\)/g, "showAlert('Sucesso', 'Link copiado para a área de transferência!', 'success')");
  content = content.replace(/alert\((err\.message \|\| 'Erro ao comentar')\)/g, "showAlert('Erro', $1, 'error')");
  
  content = content.replace(/alert\((err\.message \|\| 'Erro ao publicar\.')\)/g, "showAlert('Erro', $1, 'error')");

  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
});
