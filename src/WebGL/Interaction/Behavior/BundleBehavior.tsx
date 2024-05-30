import * as React from 'react';
import { css } from '@emotion/css';
import { useAppSelector } from '../../../Store/hooks';
import { selectActiveModel } from '../../../Store/Selectors';
import { cluster } from 'd3-hierarchy';
import { useVisContext } from '../../VisualizationContext';

export function BundleBehavior() {
    const bundles = useAppSelector((state) => state.views.present.identifiedBundles);
    const { scaledXDomain, scaledYDomain } = useVisContext();
    const clusteringResult = useAppSelector((state) => state.views.present.clusteringResult);
    const activeModel = useAppSelector(selectActiveModel);
    const activeTab = useAppSelector((state) => state.views.present.activeTab);
    const showBundles = useAppSelector((state) => state.settings.showBundles);
    
    if (!showBundles) {
        return null;
    }

    return <svg className={css`
        user-select: none;
        pointer-events: none;
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0px;
        left: 0px;
        overflow: hidden;
    `}> 
        {
            clusteringResult ? clusteringResult.map((bundle, i) => {
                // eslint-disable-next-line react/jsx-key
                return <line x1={scaledXDomain(bundle.meanStart.x)} y1={scaledYDomain(bundle.meanStart.y)} x2={scaledXDomain(bundle.meanEnd.x)} y2={scaledYDomain(bundle.meanEnd.y)} stroke="#a9a9a9d9" strokeWidth={5} />
            }) : null
        }
    </svg>;
}