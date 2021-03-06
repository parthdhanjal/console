import { K8sResourceKind, Taint } from '@console/internal/module/k8s';

export const minSelectedNode = 3;
export const ocsTaint: Taint = {
  key: 'node.ocs.openshift.io/storage',
  value: 'true',
  effect: 'NoSchedule',
};
Object.freeze(ocsTaint);

export const ocsRequestData: K8sResourceKind = {
  apiVersion: 'ocs.openshift.io/v1',
  kind: 'StorageCluster',
  metadata: {
    name: 'ocs-storagecluster',
    namespace: 'openshift-storage',
  },
  spec: {
    manageNodes: false,
    storageDeviceSets: [
      {
        name: 'ocs-deviceset',
        count: 1,
        replica: 3,
        resources: {},
        placement: {},
        portable: true,
        dataPVCTemplate: {
          spec: {
            storageClassName: '',
            accessModes: ['ReadWriteOnce'],
            volumeMode: 'Block',
            resources: {
              requests: {
                storage: '2Ti',
              },
            },
          },
        },
      },
    ],
  },
};

export const infraProvisionerMap = {
  aws: 'kubernetes.io/aws-ebs',
  vsphere: 'kubernetes.io/vsphere-volume',
};
