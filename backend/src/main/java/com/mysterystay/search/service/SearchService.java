package com.mysterystay.search.service;

import com.mysterystay.search.dto.BestStayWindowResponse;
import com.mysterystay.search.dto.DealSearchRequest;
import com.mysterystay.search.dto.DealSearchResponse;

public interface SearchService {

    DealSearchResponse searchDeals(DealSearchRequest request);

    BestStayWindowResponse findBestStayWindow(Long dealId, int stayLength);
}
