# convertisseur
un convertisseur €uro basé sur l'api fixer.io
- deux appels à l'api sont nécessaire pour fournir le service.
    - le premier etant pour récupérer le nom de devise et leur code via le endpoint `symbols`
    - le second pour récupérer la valeur via le endpoint `latest`
- Fonctionnement du programme :
    - renseigner le champs `Montant en €uro` convertion automatique avec la devise choisie
    - convertion automatique au changement de devise
    - switch de montant pour avoir la convertion pour un montant saisie à partir de la devise.
