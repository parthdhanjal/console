import * as React from 'react';
import * as d3 from 'd3';
import { observer } from 'mobx-react';
import { action, autorun, IReactionDisposer } from 'mobx';
import ElementContext from '../utils/ElementContext';
import useCallbackRef from '../utils/useCallbackRef';
import { isGraph } from '../types';

export type PanZoomTransform = {
  x: number;
  y: number;
  k: number;
};

const ZOOM_EXTENT: [number, number] = [0.25, 4];

export type PanZoomRef = (node: SVGGElement | null) => void;

export const usePanZoom = (zoomExtent: [number, number] = ZOOM_EXTENT): PanZoomRef => {
  const element = React.useContext(ElementContext);
  if (!isGraph(element)) {
    throw new Error('usePanZoom must be used within the scope of a Graph');
  }
  const elementRef = React.useRef(element);
  elementRef.current = element;

  const refCallback = useCallbackRef<PanZoomRef>(
    React.useCallback(
      (node: SVGGElement | null) => {
        let disposeListener: IReactionDisposer | undefined;
        if (node) {
          // TODO fix any type
          const $svg = d3.select(node.ownerSVGElement) as any;
          const zoom = d3
            .zoom()
            .scaleExtent(zoomExtent)
            .on(
              'zoom',
              action(() => {
                elementRef.current.setBounds(
                  elementRef.current
                    .getBounds()
                    .clone()
                    .setLocation(d3.event.transform.x, d3.event.transform.y),
                );
                elementRef.current.setScale(d3.event.transform.k);
              }),
            )
            .filter(() => !d3.event.ctrlKey && !d3.event.button);
          zoom($svg);

          // Update the d3 transform whenever the scale or bounds change.
          // This is kinda hacky because when d3 has already made the most recent transform update,
          // we listen for the model change, due to the above, only to update the d3 transform again.
          disposeListener = autorun(() => {
            const scale = elementRef.current.getScale();

            // update the min scaling value such that the user can zoom out to the new scale in case
            // it is smaller than the default zoom out scale
            zoom.scaleExtent([Math.min(scale, zoomExtent[0]), zoomExtent[1]]);
            const b = elementRef.current.getBounds();

            // update d3 zoom data directly
            // eslint-disable-next-line no-underscore-dangle
            Object.assign($svg.node().__zoom, {
              k: scale,
              x: b.x,
              y: b.y,
            });
          });

          // disable double click zoom
          // $svg.on('dblclick.zoom', null);
        }
        return () => {
          disposeListener && disposeListener();
          if (node) {
            // remove all zoom listeners
            d3.select(node.ownerSVGElement).on('.zoom', null);
          }
        };
      },
      [zoomExtent],
    ),
  );

  return refCallback;
};

export type WithPanZoomProps = {
  panZoomRef: PanZoomRef;
};

export const withPanZoom = (zoomExtent: [number, number] = ZOOM_EXTENT) => <
  P extends WithPanZoomProps
>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const Component: React.FC<Omit<P, keyof WithPanZoomProps>> = (props) => {
    const panZoomRef = usePanZoom(zoomExtent);
    return <WrappedComponent {...(props as any)} panZoomRef={panZoomRef} />;
  };
  return observer(Component);
};
