// Configuration des tarifs
function getConfig() {
    return JSON.parse(localStorage.getItem('campingConfig')) || {
        emplacementNu: {
            forfaitBase: 20,
            enfants: {
                "0-2": 0,
                "3-12": 5,
                "13-17": 7
            },
            personneSupplementaire: 10,
            electricite: 5,
            chien: 2,
            randonneur: 8,
            rechargeVelo: 2 // Ajout du tarif pour la recharge vélo
        }
    };
}

// Calcul du nombre de jours
function getNombreJours(dateDebut, dateFin) {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    const diffTime = Math.abs(fin - debut);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Vérification du nombre d'emplacements nécessaires
function verifierNombrePersonnes(nbAdultes, nbEnfants0_2, nbEnfants3_12, nbEnfants13_17, nbPersonnesSupp) {
    const totalPersonnes = nbAdultes + nbEnfants0_2 + nbEnfants3_12 + nbEnfants13_17 + nbPersonnesSupp;
    const messageEmplacements = document.getElementById('messageEmplacements');
    const prixParEmplacement = document.getElementById('prixParEmplacement');
    const nbEmplacements = document.getElementById('nbEmplacements');
    
    if (totalPersonnes > 6) {
        const nombreEmplacements = Math.ceil(totalPersonnes / 6);
        messageEmplacements.classList.remove('hidden');
        prixParEmplacement.classList.remove('hidden');
        nbEmplacements.textContent = nombreEmplacements;
        return nombreEmplacements;
    } else {
        messageEmplacements.classList.add('hidden');
        prixParEmplacement.classList.add('hidden');
        return 1;
    }
}

// Formatage de la date
function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('fr-FR', options);
}

// Gestion de l'option randonneur
document.getElementById('randonneur').addEventListener('change', function(e) {
    const optionsStandard = document.getElementById('options-standard');
    if (this.checked) {
        optionsStandard.style.display = 'none';
        // Réinitialiser les valeurs
        document.getElementById('adultes').value = '1';
        document.getElementById('enfants0_2').value = '0';
        document.getElementById('enfants3_12').value = '0';
        document.getElementById('enfants13_17').value = '0';
        document.getElementById('personnesSupp').value = '0';
    } else {
        optionsStandard.style.display = 'block';
    }
});

// Calcul du prix total
function calculerPrix() {
    const config = getConfig();
    const dateArrivee = document.getElementById('dateArrivee').value;
    const dateDepart = document.getElementById('dateDepart').value;
    const estRandonneur = document.getElementById('randonneur').checked;
    const electricite = document.getElementById('electricite').checked;
    const rechargeVelo = document.getElementById('rechargeVelo').checked;
    const nbChiens = parseInt(document.getElementById('chiens').value);
    
    if (!dateArrivee || !dateDepart || dateArrivee >= dateDepart) {
        alert('Veuillez vérifier vos dates de séjour');
        return;
    }

    if (nbChiens > 2) {
        alert('Le nombre maximum de chiens autorisés est de 2');
        document.getElementById('chiens').value = '2';
        return;
    }

    const nombreJours = getNombreJours(dateArrivee, dateDepart);
    let prixTotal = 0;
    let prixBase = 0, prixEnfants = 0, prixPersonnesSupp = 0, prixElectricite = 0, prixRechargeVelo = 0, prixChiens = 0, prixTaxe = 0;
    let nbAdultes = 0;
    
    // Affichage des dates
    document.getElementById('dateDebutSejour').textContent = formatDate(dateArrivee);
    document.getElementById('dateFinSejour').textContent = formatDate(dateDepart);
    document.getElementById('nombreNuits').textContent = nombreJours;
    
    if (estRandonneur) {
        // Pour un randonneur : tarif unique + options
        prixBase = config.emplacementNu.randonneur * nombreJours;
        prixTotal = prixBase;
        nbAdultes = 1; // Un seul adulte pour le tarif randonneur
    } else {
        // Calcul standard
        nbAdultes = parseInt(document.getElementById('adultes').value);
        const nbEnfants0_2 = parseInt(document.getElementById('enfants0_2').value);
        const nbEnfants3_12 = parseInt(document.getElementById('enfants3_12').value);
        const nbEnfants13_17 = parseInt(document.getElementById('enfants13_17').value);
        const nbPersonnesSupp = parseInt(document.getElementById('personnesSupp').value);

        // Vérifier le nombre de personnes et obtenir le nombre d'emplacements nécessaires
        const nombreEmplacements = verifierNombrePersonnes(nbAdultes, nbEnfants0_2, nbEnfants3_12, nbEnfants13_17, nbPersonnesSupp);
        
        // Calcul du prix de base (forfait 1-2 personnes)
        prixBase = config.emplacementNu.forfaitBase * nombreJours;
        
        // Calcul du prix des enfants
        prixEnfants = (
            nbEnfants0_2 * config.emplacementNu.enfants["0-2"] +
            nbEnfants3_12 * config.emplacementNu.enfants["3-12"] +
            nbEnfants13_17 * config.emplacementNu.enfants["13-17"]
        ) * nombreJours;
        
        // Calcul du prix des personnes supplémentaires
        prixPersonnesSupp = nbPersonnesSupp * config.emplacementNu.personneSupplementaire * nombreJours;

        prixTotal = prixBase + prixEnfants + prixPersonnesSupp;

        // Afficher le prix par emplacement si nécessaire
        if (nombreEmplacements > 1) {
            document.getElementById('prixDivise').textContent = (prixTotal / nombreEmplacements).toFixed(2) + '€';
            document.getElementById('prixParEmplacement').classList.remove('hidden');
        } else {
            document.getElementById('prixParEmplacement').classList.add('hidden');
        }
    }
    
    // Ajout du prix de l'électricité
    if (electricite) {
        prixElectricite = config.emplacementNu.electricite * nombreJours;
        prixTotal += prixElectricite;
    }

    // Ajout du prix de la recharge vélo
    if (rechargeVelo) {
        prixRechargeVelo = config.emplacementNu.rechargeVelo * nombreJours;
        prixTotal += prixRechargeVelo;
    }

    // Ajout du prix des chiens
    prixChiens = nbChiens * config.emplacementNu.chien * nombreJours;
    prixTotal += prixChiens;

    // Calcul de la taxe de séjour (0.22€ par nuit et par adulte)
    prixTaxe = 0.22 * nombreJours * nbAdultes;
    prixTotal += prixTaxe;

    // Affichage des détails
    document.getElementById('prixBase').textContent = prixBase.toFixed(2) + '€';
    document.getElementById('prixEnfants').textContent = prixEnfants.toFixed(2) + '€';
    document.getElementById('prixPersonnesSupp').textContent = prixPersonnesSupp.toFixed(2) + '€';
    document.getElementById('prixElectricite').textContent = prixElectricite.toFixed(2) + '€';
    document.getElementById('prixRechargeVelo').textContent = prixRechargeVelo.toFixed(2) + '€';
    document.getElementById('prixChiens').textContent = prixChiens.toFixed(2) + '€';
    document.getElementById('prixTaxe').textContent = prixTaxe.toFixed(2) + '€';
    document.getElementById('prixTotal').textContent = prixTotal.toFixed(2) + '€';

    // Afficher le résultat
    document.getElementById('resultat').classList.remove('hidden');
}

// Écouteur d'événement pour le formulaire
document.getElementById('campingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculerPrix();
});
