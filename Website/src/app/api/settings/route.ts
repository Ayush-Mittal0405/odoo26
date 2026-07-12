import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const SINGLETON_ID = "settings-singleton";

export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({ where: { id: SINGLETON_ID } });
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: SINGLETON_ID,
          weightEnvironmental: 40, weightSocial: 30, weightGovernance: 30,
          autoEmissionCalc: true, evidenceReqForCsr: true,
          badgeAutoAward: true, complianceEmailAlert: true,
        },
      });
    }
    return NextResponse.json({
      weights: {
        environmental: settings.weightEnvironmental,
        social: settings.weightSocial,
        governance: settings.weightGovernance,
      },
      toggles: {
        autoEmissionCalc: settings.autoEmissionCalc,
        evidenceReqForCsr: settings.evidenceReqForCsr,
        badgeAutoAward: settings.badgeAutoAward,
        complianceEmailAlert: settings.complianceEmailAlert,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const updated = await prisma.settings.upsert({
      where: { id: SINGLETON_ID },
      update: {
        ...(body.weights?.environmental !== undefined && { weightEnvironmental: body.weights.environmental }),
        ...(body.weights?.social !== undefined && { weightSocial: body.weights.social }),
        ...(body.weights?.governance !== undefined && { weightGovernance: body.weights.governance }),
        ...(body.toggles?.autoEmissionCalc !== undefined && { autoEmissionCalc: body.toggles.autoEmissionCalc }),
        ...(body.toggles?.evidenceReqForCsr !== undefined && { evidenceReqForCsr: body.toggles.evidenceReqForCsr }),
        ...(body.toggles?.badgeAutoAward !== undefined && { badgeAutoAward: body.toggles.badgeAutoAward }),
        ...(body.toggles?.complianceEmailAlert !== undefined && { complianceEmailAlert: body.toggles.complianceEmailAlert }),
      },
      create: {
        id: SINGLETON_ID,
        weightEnvironmental: body.weights?.environmental ?? 40,
        weightSocial: body.weights?.social ?? 30,
        weightGovernance: body.weights?.governance ?? 30,
        autoEmissionCalc: body.toggles?.autoEmissionCalc ?? true,
        evidenceReqForCsr: body.toggles?.evidenceReqForCsr ?? true,
        badgeAutoAward: body.toggles?.badgeAutoAward ?? true,
        complianceEmailAlert: body.toggles?.complianceEmailAlert ?? true,
      },
    });
    return NextResponse.json({
      weights: { environmental: updated.weightEnvironmental, social: updated.weightSocial, governance: updated.weightGovernance },
      toggles: { autoEmissionCalc: updated.autoEmissionCalc, evidenceReqForCsr: updated.evidenceReqForCsr, badgeAutoAward: updated.badgeAutoAward, complianceEmailAlert: updated.complianceEmailAlert },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
