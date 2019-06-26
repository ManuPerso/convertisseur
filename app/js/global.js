/*
 * Definition de constante pour l'api fixer.io
 */
const api='http://data.fixer.io/api/';
const query_key='?access_key=64002fb6dcfb7e1921dd492f5b3c8393';
/**
 * Class servant à récupérer les taux sur fixer.io
 */
class Taux extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            items: []
        }
        //déclaration de la methode onchange
        this.onchange = this.onchange.bind(this)
        //declaration de la methode logErreur
        this.logErreur = this.logErreur.bind(this)
        //declaration de la methode populateItems
        this.populateItems = this.populateItems.bind(this)
    }
    /**
     * fonction de gestion des erreurs
     */
    logErreur = (data) => {
        this.setState({
            isLoaded:false,
            error : {'code' : data.error.code, 'message' : data.error.info }
        })
    }
    /*
     * mettre à jours les valeurs des options du select
     * @param items : [{key,code,value},...]
     */
    populateItems = (items) => {
        //Mise à jour des variables locales.
        this.setState({
            isLoaded: true,
            items : items

        });
    }
    /*
     * Equivalent à un init
     * permet de remplir les items pour servir les options du select
     */
    componentDidMount = () => {
        //sauvegarde du contexte courant pour pouvoir l'utiliser à l'interieur du callback de retour de l'appel ajax ($.get)
        var component = this;
        items = []
        date = new Date();
        keyItems = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+'-items';
        //récupération des nom des devises
        if(!localStorage.getItem(keyItems)){
            fetch(api+'symbols'+query_key).then((reponse) => reponse.json()).then((data) => {
                if(data.success){
                    data.symbols.map((code,name) => {
                       fetch(api+'latest'+query_key+'&symbols='+code).then(
                           (response) => response.json()).then((valeurs) => {
                               if(valeurs.success){
                                  valeurs.rates.map((cle,valeur) => {
                                    item = {key : cle,  code : cle, name:name,value:valeur };
                                    items[items.length]=item;
                                  }) 
                               }else{
                                   //l'Api a renvoyé un status error, on log l'erreur et on affiche
                                   this.logErreur(valeurs);
                               }
                               localStorage.setItem(keyItems,items);
                               this.populateItems(items);
                            },
                            (error) => {
                                //si une erreur est survenue à l'appel on la log dans une variable locale
                                component.setState({
                                    isLoaded: false,
                                    error
                                });

                            }
                       )
                    });
                }else{
                    //l'Api a renvoyé un status error, on log l'erreur et on affiche
                    this.logErreur(data);
                }
            },(error) => {
                //si une erreur est survenue à l'appel on la log dans une variable locale
                component.setState({
                    isLoaded: false,
                    error
                });
            });
        }else{
            //chargement des items
            items = localStorage.getItem(keyItems);
            this.populateItems(items);

        }
        
        
           

    }
    /*
     * action du changement de valeur pour refaire les caculs
     */
    onchange = (e) =>{
        //Propagation de l'evenement
        e.preventDefault();
        //relance du calcul
        Euro.onchange(e); 
    }
        
    render = () =>{
        const { error, isLoaded, items } = this.state;
        //affichage de l'erreur si il y en a une
        if(error){
            return <span>Erreur : {error.message}</span>
        }else{
            //rendu de l'element Taux
            return (
                <React.Fragment>
                <label >Devise : </label>
                <select name="devise" id="devise" onChange={this.onchange}>
                {items.map(item => (
                    <option key={item.key} value={item.value} >{item.name}</option>
                ))}
                </select>
                </React.Fragment>
            );
        }
    }
}
/**
 * Class Euro
 * gère les inputs du system
 */
class Euro extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            value : '',
            calcul : 0, 
            devise : 'EUR'
        }
        this.onChange = this.onChange.bind(this)
    }
    /*
     * changement de valeur et recalcul
     */
    onChange = (e) => {
        //si l'évenement vient du champs de saisi, remise de l'etat locale devise à EUR
        if(e.target.id == 'index')
            this.setState({devise : 'EUR'});
        //propagation de l'evenemment aux autres ecouteurs. 
        e.preventDefault();
        //recupèration de la saisi 
        current = document.getElementById('index');
        //Remplacement des éventuel "," par des "." pour rester cohérent avec un Float
        current.value = current.value.replace(',','.')
        //Récupération du taux de convertion
        devise = document.getElementById('devise');
        //calcul (la clé de fixer.io ne permet pas d'utiliser l'api convert)
        calc = parseFloat(current.value)*parseFloat(devise.value)
        if(typeof current.value != "undefined"){
            //Mise à jour de l'état local
            this.setState({value : current.value,calcul : isNaN(calc)?0:calc.toFixed(2)})
        }else{
	    //Remise à 0 du calcul
            this.setState({calcul:0});
	}
    }
    /**
     * Evenement click du bouton de switch
     */
    onClick = (e) =>{
        //propagation de l'evenement
        e.preventDefault()
        //Vérification de l'etat locale de la devise pour faire le bon calcul
        switch(this.state.devise){
            case 'DEV' :
                if($('#calcul').val()){
                    //récupération de la valeur calculé et modification de la valeur d'entrée
                    $('#index').val(parseFloat($('#calcul').val()));
                    //Appel de l'event onchange de la classe pour mettre à jour.
                    this.onChange(e)
                    //mise à jour de la variable locale.
                    this.setState({devise : 'EUR'});
                }
                break;
            case 'EUR' :
                calc = parseFloat($('#index').val())/parseFloat($('#devise').val())
                if(!isNaN(calc)){
                    //pour ce cas on est obligé de garder au moins 5 decimal pour conserver le chiffre juste dans la case calcul
                    $('#index').val(calc.toFixed(5))
                    //Appel de l'event onchange pour mettre à jour le calcul
                    this.onChange(e)
                    //mise à jour de la variable locale, permet de switcher plusieurs fois tout en gardant le bon chiffre.
                    this.setState({devise : 'DEV'});
                }
                break;
        }
    }
    /* La méthode render via la convertion babel nous oblige à avoir une balise ouvrante/fermante qui contient le reste des champs.
     * Dans ce cas nous utilison la balise <React.Fragment></React.Fragement> pour ne pas ajouter une autre balise de container.
     * NB: la balise Taux fait appel au render de la class Taux.
     */
    render = () =>{
        const {value,calcul,result,devise} = this.state;
        return(
            <React.Fragment>
            <figure> <img src="app/img/th.jpeg" onClick={this.onClick} id="switch" /></figure>
            <div>
                <label>Montant en €uro : </label>
                <input type="text" id="index" defaultValue={value} onChange={this.onChange} />
                <Taux />
                <label>Montant : </label>
                <input type="text" id="calcul" readOnly="readOnly" value={calcul} />
            </div>
            </React.Fragment>
        )
        //le calcul ne se fait que sur l'event placé sur l'id index, mise en readonly de cet input pour ne pas qu'il soit modifier par l'internaute.
    }
}
/**
 * Element à afficher
 */
const elm =(
    <React.Fragment>
    <Euro />
    </React.Fragment>
)
/*
 * Récupération du container
 */
const DomElm = document.querySelector('#container');
/*
 * Rendu
 */
ReactDOM.render(elm,DomElm);
//export default Euro;
