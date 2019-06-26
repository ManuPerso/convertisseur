# convertisseur
un convertisseur €uro basé sur l'api fixer.io
- deux appels à l'api sont nécessaire pour fournir le service.
    - le premier etant pour récupérer le nom de devise et leur code via le endpoint `symbols`
    - le second pour récupérer la valeur via le endpoint `latest`
- Fonctionnement du programme :
    - renseigner le champs `Montant en €uro`  : convertion automatique avec la devise choisie
    - convertion automatique au changement de devise
    - switch de montant pour avoir la convertion pour un montant saisie à partir de la devise.
## Attention ! ##
- Le programme fait autant de hit qu'il y a de devises dans la liste déroulante. (environ 177 par chargement du programme)
- on stocke le retour de l'api une fois par jours dans un localstorage pour ne pas à avoir à pinger l'api à chaque fois
- une limit de 1000 hit / mois est fixé par fixer.io
