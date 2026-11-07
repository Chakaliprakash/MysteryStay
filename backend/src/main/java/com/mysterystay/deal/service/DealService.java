package com.mysterystay.deal.service;

import com.mysterystay.deal.dto.CreateMysteryDealRequest;
import com.mysterystay.deal.dto.ManagerDealResponse;
import com.mysterystay.deal.dto.MaskedDealResponse;

import java.util.List;

public interface DealService {

    ManagerDealResponse createMysteryDeal(CreateMysteryDealRequest request, Long managerId, boolean isAdmin);

    List<MaskedDealResponse> getAllActiveMysteryDeals();

    MaskedDealResponse getMaskedDealById(Long dealId);

    List<ManagerDealResponse> getMyDeals(Long managerId);

    ManagerDealResponse toggleDealStatus(Long dealId, boolean active, Long managerId, boolean isAdmin);
}
