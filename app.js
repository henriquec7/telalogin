function Cardapio() {
  var section = document.getElementById("cardapio");
  var offset = 80;

  if (!section) return;

  window.scrollTo({
    top: section.offsetTop - offset,
    behavior: "smooth",
  });
}

function iniciarAnimacao() {
  var elementos = document.querySelectorAll(".reveal");

  if (!elementos.length) return;

  var obs = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

  elementos.forEach(function (el) {
    obs.observe(el);
  });
}

function iniciarCardapioECarrinho() {
  var produtos = {
    cafes: [
      { nome: "Espresso", preco: 7.9, desc: "Café puro e intenso, extraído na pressão perfeita." },
      { nome: "Cappuccino", preco: 12.9, desc: "Espresso com leite vaporizado e espuma cremosa." },
      { nome: "Latte", preco: 14.9, desc: "Espresso suave com leite sedoso e latte art." },
      {
        nome: "Americano",
        preco: 9.9,
        desc: "Espresso diluído em água quente, sabor equilibrado.",
      },
      { nome: "Macchiato", preco: 10.9, desc: "Espresso marcado com toque de espuma de leite." },
    ],
    especiais: [
      { nome: "Mocha", preco: 15.9, desc: "Mistura perfeita de café, leite e chocolate." },
      { nome: "Caramel Latte", preco: 16.9, desc: "Latte cremoso com calda de caramelo." },
      { nome: "Vanilla Coffee", preco: 15.5, desc: "Café especial com toque suave de baunilha." },
      { nome: "Affogato", preco: 18.9, desc: "Espresso servido com sorvete cremoso." },
    ],
    doces: [
      { nome: "Donut", preco: 8.9, desc: "Donut macio com cobertura especial." },
      { nome: "Brownie", preco: 10.9, desc: "Brownie de chocolate intenso." },
      { nome: "Cheesecake", preco: 13.9, desc: "Cheesecake cremoso com calda de frutas." },
      { nome: "Cookie", preco: 7.9, desc: "Cookie artesanal com gotas de chocolate." },
    ],
    salgados: [
      { nome: "Pão de Queijo", preco: 6.9, desc: "Quentinho, macio e crocante por fora." },
      { nome: "Croissant", preco: 11.9, desc: "Croissant amanteigado com massa leve." },
      { nome: "Sanduíche Natural", preco: 14.9, desc: "Opção leve com recheio fresco." },
      { nome: "Empada", preco: 9.9, desc: "Empada dourada com recheio cremoso." },
    ],
  };

  var grid = document.getElementById("gridCardapio");
  var botoesCategoria = document.querySelectorAll(".categoria");
  var btnAbrirCarrinho = document.getElementById("abrirCarrinho");
  var btnFecharCarrinho = document.getElementById("fecharCarrinho");
  var overlayCarrinho = document.getElementById("overlayCarrinho");
  var carrinhoEl = document.getElementById("carrinho");
  var itensCarrinhoEl = document.getElementById("itensCarrinho");
  var totalEl = document.getElementById("total");
  var totalFinalizacaoEl = document.getElementById("totalFinalizacao");
  var contadorEl = document.getElementById("contadorCarrinho");
  var btnFinalizar = document.getElementById("finalizar");
  var telaCarrinho = document.getElementById("telaCarrinho");
  var formPedido = document.getElementById("formPedido");
  var pedidoConfirmado = document.getElementById("pedidoConfirmado");
  var nomeCliente = document.getElementById("nomeCliente");
  var observacao = document.getElementById("observacao");
  var mensagemConfirmacao = document.getElementById("mensagemConfirmacao");
  var observacaoConfirmada = document.getElementById("observacaoConfirmada");
  var btnVoltarCarrinho = document.getElementById("voltarCarrinho");
  var btnNovoPedido = document.getElementById("novoPedido");
  var etapas = document.querySelectorAll(".etapa");
  var carrinho = [];

  function formatarMoeda(valor) {
    return "R$ " + valor.toFixed(2).replace(".", ",");
  }

  function renderProdutos(categoria) {
    if (!grid || !produtos[categoria]) return;

    grid.innerHTML = "";

    produtos[categoria].forEach(function (produto) {
      var card = document.createElement("div");
      card.className = "card-item reveal is-visible";
      card.innerHTML =
        '<div class="topo">' +
        "<h3>" +
        produto.nome +
        "</h3>" +
        '<span class="preco">' +
        formatarMoeda(produto.preco) +
        "</span>" +
        "</div>" +
        "<p>" +
        produto.desc +
        "</p>" +
        '<button type="button" class="btn-adicionar">+ Adicionar</button>';

      card.querySelector(".btn-adicionar").addEventListener("click", function () {
        adicionarAoCarrinho(produto.nome);
      });

      grid.appendChild(card);
    });
  }

  function encontrarProduto(nome) {
    var categorias = Object.keys(produtos);

    for (var i = 0; i < categorias.length; i++) {
      var categoria = categorias[i];
      var item = produtos[categoria].find(function (produto) {
        return produto.nome === nome;
      });
      if (item) return item;
    }

    return null;
  }

  function itensAgrupados() {
    var agrupados = [];

    carrinho.forEach(function (item) {
      var existente = agrupados.find(function (produto) {
        return produto.nome === item.nome;
      });

      if (existente) {
        existente.quantidade += 1;
      } else {
        agrupados.push({ nome: item.nome, preco: item.preco, desc: item.desc, quantidade: 1 });
      }
    });

    return agrupados;
  }

  function calcularTotal() {
    return carrinho.reduce(function (total, item) {
      return total + item.preco;
    }, 0);
  }

  function mostrarTela(tela) {
    [telaCarrinho, formPedido, pedidoConfirmado].forEach(function (elemento) {
      if (elemento) elemento.classList.remove("ativa");
    });

    etapas.forEach(function (etapa) {
      etapa.classList.toggle("ativa", etapa.dataset.etapa === tela);
    });

    if (tela === "carrinho") telaCarrinho.classList.add("ativa");
    if (tela === "dados") formPedido.classList.add("ativa");
    if (tela === "confirmado") pedidoConfirmado.classList.add("ativa");
  }

  function adicionarAoCarrinho(nome) {
    var produto = encontrarProduto(nome);
    if (!produto) return;

    carrinho.push(produto);
    atualizarCarrinho();
    mostrarTela("carrinho");
    abrirCarrinho();
  }

  function removerDoCarrinho(nome, removerTodos) {
    if (removerTodos) {
      carrinho = carrinho.filter(function (item) {
        return item.nome !== nome;
      });
    } else {
      var index = carrinho.findIndex(function (item) {
        return item.nome === nome;
      });
      if (index >= 0) carrinho.splice(index, 1);
    }

    atualizarCarrinho();
  }

  function atualizarCarrinho() {
    if (!itensCarrinhoEl || !totalEl || !contadorEl) return;

    var total = calcularTotal();
    var agrupados = itensAgrupados();

    itensCarrinhoEl.innerHTML = "";
    contadorEl.innerText = carrinho.length;
    totalEl.innerText = formatarMoeda(total);
    totalFinalizacaoEl.innerText = formatarMoeda(total);
    btnFinalizar.disabled = carrinho.length === 0;

    if (carrinho.length === 0) {
      itensCarrinhoEl.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio.</p>';
      return;
    }

    agrupados.forEach(function (item) {
      var itemCarrinho = document.createElement("div");
      itemCarrinho.className = "item-carrinho";
      itemCarrinho.innerHTML =
        '<div class="item-topo">' +
        '<div><span class="item-nome">' +
        item.nome +
        '</span><span class="item-preco">' +
        formatarMoeda(item.preco) +
        "</span></div>" +
        '<button type="button" class="btn-remover" aria-label="Remover item">✕</button>' +
        "</div>" +
        '<div class="item-acoes">' +
        '<div class="controle-quantidade">' +
        '<button type="button" class="btn-quantidade diminuir" aria-label="Diminuir quantidade">−</button>' +
        '<span class="quantidade">' +
        item.quantidade +
        "</span>" +
        '<button type="button" class="btn-quantidade aumentar" aria-label="Aumentar quantidade">+</button>' +
        "</div>" +
        '<span class="subtotal">' +
        formatarMoeda(item.preco * item.quantidade) +
        "</span>" +
        "</div>";

      itemCarrinho.querySelector(".btn-remover").addEventListener("click", function () {
        removerDoCarrinho(item.nome, true);
      });
      itemCarrinho.querySelector(".diminuir").addEventListener("click", function () {
        removerDoCarrinho(item.nome, false);
      });
      itemCarrinho.querySelector(".aumentar").addEventListener("click", function () {
        adicionarAoCarrinho(item.nome);
      });

      itensCarrinhoEl.appendChild(itemCarrinho);
    });
  }

  function abrirCarrinho() {
    carrinhoEl.classList.add("ativo");
    overlayCarrinho.classList.add("ativo");
    document.body.classList.add("carrinho-aberto");
  }

  function fecharCarrinho() {
    carrinhoEl.classList.remove("ativo");
    overlayCarrinho.classList.remove("ativo");
    document.body.classList.remove("carrinho-aberto");
  }

  botoesCategoria.forEach(function (botao) {
    botao.addEventListener("click", function () {
      document.querySelector(".categoria.ativa").classList.remove("ativa");
      botao.classList.add("ativa");
      renderProdutos(botao.dataset.cat);
    });
  });

  btnAbrirCarrinho.addEventListener("click", function () {
    mostrarTela("carrinho");
    abrirCarrinho();
  });
  btnFecharCarrinho.addEventListener("click", fecharCarrinho);
  overlayCarrinho.addEventListener("click", fecharCarrinho);

  btnFinalizar.addEventListener("click", function () {
    if (carrinho.length === 0) return;
    mostrarTela("dados");
    nomeCliente.focus();
  });

  btnVoltarCarrinho.addEventListener("click", function () {
    mostrarTela("carrinho");
  });

  formPedido.addEventListener("submit", function (event) {
    event.preventDefault();

    var nome = nomeCliente.value.trim();
    var obs = observacao.value.trim();

    if (!nome) {
      nomeCliente.focus();
      return;
    }

    mensagemConfirmacao.innerText =
      "Obrigado, " +
      nome +
      ". Seu pedido de " +
      formatarMoeda(calcularTotal()) +
      " foi enviado para preparo.";

    if (obs) {
      observacaoConfirmada.innerText = obs;
      observacaoConfirmada.classList.add("ativa");
    } else {
      observacaoConfirmada.innerText = "";
      observacaoConfirmada.classList.remove("ativa");
    }

    mostrarTela("confirmado");
  });

  btnNovoPedido.addEventListener("click", function () {
    carrinho = [];
    nomeCliente.value = "";
    observacao.value = "";
    atualizarCarrinho();
    mostrarTela("carrinho");
    fecharCarrinho();
  });

  renderProdutos("cafes");
  atualizarCarrinho();
  mostrarTela("carrinho");
}

document.addEventListener("DOMContentLoaded", function () {
  iniciarAnimacao();
  iniciarCardapioECarrinho();
});
