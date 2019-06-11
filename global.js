function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Definition de constante pour l'api fixer.io
 */
var api = 'http://data.fixer.io/api/';
//const query_key='?access_key=ba8eb9bd4a1486757cd3982dc3bdbb3c';
var query_key = '?access_key=0eae0066a65fb9359634f1aec399ba99';
/**
 * Class servant à récupérer les taux sur fixer.io
 */

var Taux = function (_React$Component) {
    _inherits(Taux, _React$Component);

    function Taux(props) {
        _classCallCheck(this, Taux);

        var _this = _possibleConstructorReturn(this, (Taux.__proto__ || Object.getPrototypeOf(Taux)).call(this, props));

        _this.componentDidMount = function () {
            //sauvegarde du contexte courant pour pouvoir l'utiliser à l'interieur du callback de retour de l'appel ajax ($.get)
            var component = _this;
            items = [];
            //récupération des nom des devises
            $.get(api + 'symbols' + query_key, function (data) {
                $.map(data.symbols, function (name, code) {
                    //recuperation des valeurs des devises
                    $.get(api + 'latest' + query_key + '&symbols=' + code, function (res) {
                        $.map(res.rates, function (value, code) {
                            //Création d'une clé nécessaire à l'affichage des options (évite le warning de React)
                            //restructuration des données pour ne conserver que l'essentiel.
                            item = { key: code, code: code, name: name, value: value };
                            items[items.length] = item;
                            //Mise à jour des variables locales.
                            component.setState({
                                isLoaded: true,
                                items: items

                            });
                        });
                    });
                });
            }).fail(function (jqxhr, settings, error) {
                //si une erreur est survenue à l'appel on la log dans une variable locale
                component.setState({
                    isLoaded: true,
                    error: error
                });
            });
        };

        _this.onchange = function (e) {
            //Propagation de l'evenement
            e.preventDefault();
            //récupération du champs de saisie
            current = $('#index');
            //recupération de la valeur de la devise
            devise = $('#devise');
            calc = parseFloat(current.val()) * parseFloat(devise.val());
            //calcul et affichage
            $('#calcul').val(isNaN(calc) ? 0 : calc.toFixed(2));
        };

        _this.render = function () {
            var _this$state = _this.state,
                error = _this$state.error,
                isLoaded = _this$state.isLoaded,
                items = _this$state.items;
            //affichage de l'erreur si il y en a une

            if (error) {
                return React.createElement(
                    'div',
                    null,
                    'Erreur : ',
                    error.message
                );
            } else {
                //rendu de l'element Taux
                return React.createElement(
                    React.Fragment,
                    null,
                    React.createElement(
                        'label',
                        null,
                        'Devise : '
                    ),
                    React.createElement(
                        'select',
                        { name: 'devise', id: 'devise', onChange: _this.onchange },
                        items.map(function (item) {
                            return React.createElement(
                                'option',
                                { key: item.key, value: item.value },
                                item.name
                            );
                        })
                    )
                );
            }
        };

        _this.state = {
            error: null,
            isLoaded: false,
            items: []
            //déclaration de la methode onchange
        };_this.onchange = _this.onchange.bind(_this);
        return _this;
    }
    /*
     * Equivalent à un init
     * permet de remplir les items pour servir les options du select
     */

    /*
     * action du changement de valeur pour refaire les caculs
     */


    return Taux;
}(React.Component);
/**
 * Class Euro
 * gère les inputs du system
 */


var Euro = function (_React$Component2) {
    _inherits(Euro, _React$Component2);

    function Euro(props) {
        _classCallCheck(this, Euro);

        var _this2 = _possibleConstructorReturn(this, (Euro.__proto__ || Object.getPrototypeOf(Euro)).call(this, props));

        _this2.onChange = function (e) {
            //si l'évenement vient du champs de saisi, remise de l'etat locale devise à EUR
            if ($(e.target).attr('id') == 'index') _this2.setState({ devise: 'EUR' });
            //propagation de l'evenemment aux autres ecouteurs. 
            e.preventDefault();
            //recupèration de la saisi 
            current = $('#index');
            //Remplacement des éventuel "," par des "." pour rester cohérent avec un Float
            current.val(current.val().replace(',', '.'));
            //Récupération du taux de convertion
            devise = $('#devise');
            //calcul (la clé de fixer.io ne permet pas d'utiliser l'api convert)
            calc = parseFloat(current.val()) * parseFloat(devise.val());
            if (typeof current.val() != "undefined") {
                //Mise à jour de l'état local
                _this2.setState({ value: current.val(), calcul: isNaN(calc) ? 0 : calc.toFixed(2) });
            } else {
                //Remise à 0 du calcul
                _this2.setState({ calcul: 0 });
            }
        };

        _this2.onClick = function (e) {
            //propagation de l'evenement
            e.preventDefault();
            //Vérification de l'etat locale de la devise pour faire le bon calcul
            switch (_this2.state.devise) {
                case 'DEV':
                    if ($('#calcul').val()) {
                        //récupération de la valeur calculé et modification de la valeur d'entrée
                        $('#index').val(parseFloat($('#calcul').val()));
                        //Appel de l'event onchange de la classe pour mettre à jour.
                        _this2.onChange(e);
                        //mise à jour de la variable locale.
                        _this2.setState({ devise: 'EUR' });
                    }
                    break;
                case 'EUR':
                    calc = parseFloat($('#index').val()) / parseFloat($('#devise').val());
                    if (!isNaN(calc)) {
                        //pour ce cas on est obligé de garder au moins 5 decimal pour conserver le chiffre juste dans la case calcul
                        $('#index').val(calc.toFixed(5));
                        //Appel de l'event onchange pour mettre à jour le calcul
                        _this2.onChange(e);
                        //mise à jour de la variable locale, permet de switcher plusieurs fois tout en gardant le bon chiffre.
                        _this2.setState({ devise: 'DEV' });
                    }
                    break;
            }
        };

        _this2.render = function () {
            var _this2$state = _this2.state,
                value = _this2$state.value,
                calcul = _this2$state.calcul,
                result = _this2$state.result,
                devise = _this2$state.devise;

            return React.createElement(
                React.Fragment,
                null,
                React.createElement(
                    'figure',
                    null,
                    ' ',
                    React.createElement('img', { src: 'app/img/th.jpeg', onClick: _this2.onClick, id: 'switch' })
                ),
                React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'label',
                        null,
                        'Montant en \u20ACuro : '
                    ),
                    React.createElement('input', { type: 'text', id: 'index', defaultValue: value, onChange: _this2.onChange }),
                    React.createElement(Taux, null),
                    React.createElement(
                        'label',
                        null,
                        'Montant : '
                    ),
                    React.createElement('input', { type: 'text', id: 'calcul', readOnly: 'readOnly', value: calcul })
                )
            );
            //le calcul ne se fait que sur l'event placé sur l'id index, mise en readonly de cet input pour ne pas qu'il soit modifier par l'internaute.
        };

        _this2.state = {
            value: '',
            calcul: 0,
            devise: 'EUR'
        };
        _this2.onChange = _this2.onChange.bind(_this2);
        return _this2;
    }
    /*
     * changement de valeur et recalcul
     */

    /**
     * Evenement click du bouton de switch
     */

    /* La méthode render via la convertion babel nous oblige à avoir une balise ouvrante/fermante qui contient le reste des champs.
     * Dans ce cas nous utilison la balise <React.Fragment></React.Fragement> pour ne pas ajouter une autre balise de container.
     * NB: la balise Taux fait appel au render de la class Taux.
     */


    return Euro;
}(React.Component);
/**
 * Element à afficher
 */


var elm = React.createElement(
    React.Fragment,
    null,
    React.createElement(Euro, null)
);
/*
 * Réupération du container
 */
var DomElm = document.querySelector('#container');
/*
 * Rendu
 */
ReactDOM.render(elm, DomElm);