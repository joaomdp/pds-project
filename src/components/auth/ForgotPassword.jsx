export default function ForgotPassword({ onVoltar }) {
  return (
    <div className="text-center space-y-8">
      <div className="space-y-3">
        <div className="bg-white/10 p-4 rounded-full inline-block">
          <i className="bx bx-lock-open text-4xl text-white"></i>
        </div>
        <h2 className="text-2xl font-bold text-white">Recuperar senha</h2>
      </div>

      <div className="bg-white/10 p-6 rounded-xl shadow-lg">
        <p className="text-white text-base leading-relaxed">
          Para redefinir sua senha, entre em contato diretamente com o
          desenvolvedor da aplicação através do e-mail abaixo.
        </p>
      </div>

      <a
        href="https://mail.google.com/mail/?view=cm&fs=1&to=joaomdp.dev@gmail.com&su=Recupera%C3%A7%C3%A3o%20de%20Senha&body=Ol%C3%A1,%20preciso%20de%20ajuda%20para%20recuperar%20minha%20senha."
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-green-500/20 text-base"
      >
        <i className="bx bx-envelope text-xl"></i>
        Enviar e-mail via Gmail
      </a>

      <div>
        <button
          onClick={onVoltar}
          className="inline-flex items-center text-white hover:text-green-300 transition-colors text-base font-medium"
        >
          <i className="bx bx-arrow-back mr-2 text-xl"></i>
          Voltar para login
        </button>
      </div>
    </div>
  );
}
