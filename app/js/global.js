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
    }
    /*
     * Equivalent à un init
     * permet de remplir les items pour servir les options du select
     */
    componentDidMount = () => {
        //sauvegarde du contexte courant pour pouvoir l'utiliser à l'interieur du callback de retour de l'appel ajax ($.get)
        var component = this;
        items = []
        //récupération des nom des devises
        $.get(api+'symbols'+query_key,function(data){
            $.map(data.symbols,function(name,code){
                //recuperation des valeurs des devises
                $.get(api+'latest'+query_key+'&symbols='+code,function(res){
                    $.map(res.rates,function(value,code){	
                        //Création d'une clé nécessaire à l'affichage des options (évite le warning de React)
                        //restructuration des données pour ne conserver que l'essentiel.
                        item = {key : code,  code : code, name:name,value:value }
                        items[items.length] = item;
                        //Mise à jour des variables locales.
                        component.setState({
                            isLoaded: true,
                            items : items

                        });
                    });
                });
            })
            
        }).fail(function( jqxhr, settings, error ){
            //si une erreur est survenue à l'appel on la log dans une variable locale
            component.setState({
                isLoaded: true,
                error
            });
        })                
    }
    /*
     * action du changement de valeur pour refaire les caculs
     */
    onchange = (e) =>{
        //Propagation de l'evenement
        e.preventDefault();
        //récupération du champs de saisie
        current = $('#index');
        //recupération de la valeur de la devise
        devise = $('#devise');
        calc = parseFloat(current.val())*parseFloat(devise.val())
        //calcul et affichage
        $('#calcul').val(isNaN(calc)?0:calc.toFixed(2))
    
        
    }
        
    render = () =>{
        const { error, isLoaded, items } = this.state;
        //affichage de l'erreur si il y en a une
        if(error){
            return <div>Erreur : {error.message}</div>
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
        if($(e.target).attr('id') == 'index')
            this.setState({devise : 'EUR'});
        //propagation de l'evenemment aux autres ecouteurs. 
        e.preventDefault();
        //recupèration de la saisi 
        current = $('#index');
        //Remplacement des éventuel "," par des "." pour rester cohérent avec un Float
        current.val(current.val().replace(',','.'))
        //Récupération du taux de convertion
        devise = $('#devise');
        //calcul (la clé de fixer.io ne permet pas d'utiliser l'api convert)
        calc = parseFloat(current.val())*parseFloat(devise.val())
        if(typeof current.val() != "undefined"){
            //Mise à jour de l'état local
            this.setState({value : current.val(),calcul : isNaN(calc)?0:calc.toFixed(2)})
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
 * Réupération du container
 */
const DomElm = document.querySelector('#container');
/*
 * Rendu
 */
ReactDOM.render(elm,DomElm);
