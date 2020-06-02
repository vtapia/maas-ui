import { Col, Row, Spinner } from "@canonical/react-components";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { pod as podActions } from "app/base/actions";
import { pod as podSelectors } from "app/base/selectors";
import { useWindowTitle } from "app/base/hooks";
import Section from "app/base/components/Section";

const KVMList = () => {
  useWindowTitle("KVM");
  const dispatch = useDispatch();

  const pods = useSelector(podSelectors.all);
  const podsLoading = useSelector(podSelectors.loading);

  useEffect(() => {
    dispatch(podActions.fetch());
  }, [dispatch]);

  return (
    <Section title="KVM">
      <Row>
        <Col size={12}>
          <div>
            {podsLoading && (
              <div className="u-align--center">
                <Spinner text="Loading..." />
              </div>
            )}
            <table>
              <thead>
                <tr>
                  <th>FQDN</th>
                  <th>Power</th>
                  <th>VM Host Type</th>
                  <th>VMs</th>
                  <th>OS</th>
                  <th>Resource Pool</th>
                  <th>CPU</th>
                  <th>RAM</th>
                  <th>Storage</th>
                </tr>
              </thead>
              <tbody>
                {pods.map((pod) => (
                  <tr key={pod.id}>
                    <td>
                      <Link to={`/kvm/${pod.id}`}>{pod.name}</Link>
                    </td>
                    <td>Unknown</td>
                    <td>Unknown</td>
                    <td>Unknown</td>
                    <td>Unknown</td>
                    <td>Unknown</td>
                    <td>Unknown</td>
                    <td>Unknown</td>
                    <td>Unknown</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Col>
      </Row>
    </Section>
  );
};

export default KVMList;
