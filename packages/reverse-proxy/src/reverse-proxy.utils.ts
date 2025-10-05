import { CampaignModel, HttpServerRequest, TargetModel } from '@famir/domain'

type HttpRequestLocalsCampaign = HttpServerRequest & {
  locals: {
    campaign: CampaignModel
  }
}

type HttpRequestLocalsTarget = HttpServerRequest & {
  locals: {
    target: TargetModel
  }
}

export function assertRequestLocalsCampaign(
  data: HttpServerRequest
): asserts data is HttpRequestLocalsCampaign {
  if (!(data.locals != null && data.locals.campaign != null)) {
    throw new Error(`Request locals campaign not set`)
  }
}

export function assertRequestLocalsTarget(
  data: HttpServerRequest
): asserts data is HttpRequestLocalsTarget {
  if (!(data.locals != null && data.locals.target != null)) {
    throw new Error(`Request locals target not set`)
  }
}
