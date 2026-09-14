package com.marco.Simba_CTD.mapper;

import org.springframework.stereotype.Component;
import com.marco.Simba_CTD.entity.Collectivite;
import com.marco.Simba_CTD.request.CollectiviteRequest;
import com.marco.Simba_CTD.dto.CollectiviteDTO;

@Component
public class CollectiviteMapper {
/*Le mapper est utilisé pour convertir les entités en DTO et vice versa.
il est aussi utilisé pour mettre à jour les entités existantes avec les données des requetes.  
*/
    public CollectiviteDTO toDTO(Collectivite entity) {
        if (entity == null) return null;
        return new CollectiviteDTO(
                entity.getId(),
                entity.getCode(),
                entity.getNom(),
                entity.getType(),
                entity.getRegion(),
                entity.getDepartement(),
                entity.getArrondissement(),
                entity.getAdresse(),
                entity.getEmail(),
                entity.getTelephone(),
                entity.getLogoUrl(),
                entity.getStatut(),
                entity.getFuseauHoraire(),
                entity.getDevise(),
                entity.getCouleurPrincipale(),
                entity.getCouleurAccent(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public Collectivite toEntity(CollectiviteRequest request) {
        Collectivite entity = new Collectivite();
        entity.setCode(request.code());
        entity.setNom(request.nom());
        entity.setType(request.type());
        entity.setRegion(request.region());
        entity.setDepartement(request.departement());
        entity.setArrondissement(request.arrondissement());
        entity.setAdresse(request.adresse());
        entity.setTelephone(request.telephone());
        entity.setEmail(request.email());
        entity.setLogoUrl(request.logoUrl());
        // si statut null, l'entity garde son default ACTIVE
        if (request.statut() != null) entity.setStatut(request.statut());
        if (request.fuseauHoraire() != null) entity.setFuseauHoraire(request.fuseauHoraire());
        if (request.devise() != null) entity.setDevise(request.devise());
        if (request.couleurPrincipale() != null) entity.setCouleurPrincipale(request.couleurPrincipale());
        if (request.couleurAccent() != null) entity.setCouleurAccent(request.couleurAccent());
        return entity;
    }

    public void updateEntity(
          Collectivite entity,
          CollectiviteRequest request
    ) {

      entity.setCode(request.code());
      entity.setNom(request.nom());
      entity.setType(request.type());

      entity.setRegion(request.region());
      entity.setDepartement(request.departement());
      entity.setArrondissement(request.arrondissement());

      entity.setAdresse(request.adresse());
      entity.setTelephone(request.telephone());
      entity.setEmail(request.email());

      entity.setLogoUrl(request.logoUrl());

      if (request.statut() != null) {
          entity.setStatut(request.statut());
      }

      if (request.fuseauHoraire() != null) {
          entity.setFuseauHoraire(request.fuseauHoraire());
      }

      if (request.devise() != null) {
          entity.setDevise(request.devise());
      }

      if (request.couleurPrincipale() != null) {
          entity.setCouleurPrincipale(request.couleurPrincipale());
      }

      if (request.couleurAccent() != null) {
          entity.setCouleurAccent(request.couleurAccent());
      }
    }
}
