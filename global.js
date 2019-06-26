function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Definition de constante pour l'api fixer.io
 */
var api = 'http://data.fixer.io/api/';
var query_key = '?access_key=64002fb6dcfb7e1921dd492f5b3c8393';
/**
 * Class servant à récupérer les taux sur fixer.io
 */

var Taux = function (_React$Component) {
    _inherits(Taux, _React$Component);

    function Taux(props) {
        _classCallCheck(this, Taux);

        var _this = _possibleConstructorReturn(this, (Taux.__proto__ || Object.getPrototypeOf(Taux)).call(this, props));

        _this.logErreur = function (data) {
            _this.setState({
                isLoaded: false,
                error: { 'code': data.error.code, 'message': data.error.info }
            });
        };

        _this.populateItems = function (items) {
            //Mise à jour des variables locales.
            _this.setState({
                isLoaded: true,
                items: items

            });
        };

        _this.componentDidMount = function () {
            //sauvegarde du contexte courant pour pouvoir l'utiliser à l'interieur du callback de retour de l'appel ajax ($.get)
            var component = _this;
            items = [];
            date = new Date();
            keyItems = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '-items';
            //récupération des nom des devises
            if (!localStorage.getItem(keyItems)) {
                fetch(api + 'symbols' + query_key).then(function (reponse) {
                    return reponse.json();
                }).then(function (data) {
                    if (data.success) {
                        data.symbols.map(function (code, name) {
                            fetch(api + 'latest' + query_key + '&symbols=' + code).then(function (response) {
                                return response.json();
                            }).then(function (valeurs) {
                                if (valeurs.success) {
                                    valeurs.rates.map(function (cle, valeur) {
                                        item = { key: cle, code: cle, name: name, value: valeur };
                                        items[items.length] = item;
                                    });
                                } else {
                                    //l'Api a renvoyé un status error, on log l'erreur et on affiche
                                    _this.logErreur(valeurs);
                                }
                                localStorage.setItem(keyItems, items);
                                _this.populateItems(items);
                            }, function (error) {
                                //si une erreur est survenue à l'appel on la log dans une variable locale
                                component.setState({
                                    isLoaded: false,
                                    error: error
                                });
                            });
                        });
                    } else {
                        //l'Api a renvoyé un status error, on log l'erreur et on affiche
                        _this.logErreur(data);
                    }
                }, function (error) {
                    //si une erreur est survenue à l'appel on la log dans une variable locale
                    component.setState({
                        isLoaded: false,
                        error: error
                    });
                });
            } else {
                //chargement des items
                items = localStorage.getItem(keyItems);
                _this.populateItems(items);
            }
        };

        _this.onchange = function (e) {
            //Propagation de l'evenement
            e.preventDefault();
            //relance du calcul
            Euro.onchange(e);
        };

        _this.render = function () {
            var _this$state = _this.state,
                error = _this$state.error,
                isLoaded = _this$state.isLoaded,
                items = _this$state.items;
            //affichage de l'erreur si il y en a une

            if (error) {
                return React.createElement(
                    'span',
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
        //declaration de la methode logErreur
        _this.logErreur = _this.logErreur.bind(_this);
        //declaration de la methode populateItems
        _this.populateItems = _this.populateItems.bind(_this);
        return _this;
    }
    /**
     * fonction de gestion des erreurs
     */

    /*
     * mettre à jours les valeurs des options du select
     * @param items : [{key,code,value},...]
     */

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
            if (e.target.id == 'index') _this2.setState({ devise: 'EUR' });
            //propagation de l'evenemment aux autres ecouteurs. 
            e.preventDefault();
            //recupèration de la saisi 
            current = document.getElementById('index');
            //Remplacement des éventuel "," par des "." pour rester cohérent avec un Float
            current.value = current.value.replace(',', '.');
            //Récupération du taux de convertion
            devise = document.getElementById('devise');
            //calcul (la clé de fixer.io ne permet pas d'utiliser l'api convert)
            calc = parseFloat(current.value) * parseFloat(devise.value);
            if (typeof current.value != "undefined") {
                //Mise à jour de l'état local
                _this2.setState({ value: current.value, calcul: isNaN(calc) ? 0 : calc.toFixed(2) });
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
 * Récupération du container
 */
var DomElm = document.querySelector('#container');
/*
 * Rendu
 */
ReactDOM.render(elm, DomElm);
//export default Euro;