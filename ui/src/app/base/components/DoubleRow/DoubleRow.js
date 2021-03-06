import PropTypes from "prop-types";
import { useRef } from "react";
import classNames from "classnames";

import TableMenu from "app/base/components/TableMenu";

const DoubleRow = ({
  className,
  icon,
  iconSpace,
  iconTitle,
  menuClassName,
  menuLinks,
  menuTitle,
  onToggleMenu,
  primary,
  primaryAriaLabel,
  primaryClassName,
  primaryTextClassName,
  primaryTitle,
  secondary,
  secondaryAriaLabel,
  secondaryClassName,
  secondaryTitle,
}) => {
  const parent = useRef(null);
  const hasIcon = icon || iconSpace;

  return (
    <div
      className={classNames(
        {
          "p-double-row": !hasIcon,
          "p-double-row--with-icon": hasIcon,
        },
        className
      )}
    >
      {hasIcon ? (
        <div className="p-double-row__icon">
          {icon || <div className="p-double-row__icon-space"></div>}
        </div>
      ) : null}
      <div className="p-double-row__rows-container">
        <div
          className={classNames("p-double-row__primary-row", primaryClassName)}
          aria-label={primaryAriaLabel}
          ref={parent}
        >
          <div
            className={classNames(
              "p-double-row__primary-row-text u-truncate",
              primaryTextClassName
            )}
            title={primaryTitle}
          >
            {primary}
          </div>
          {menuLinks ? (
            <TableMenu
              className={menuClassName}
              links={menuLinks}
              title={menuTitle}
              onToggleMenu={onToggleMenu}
              positionNode={parent.current}
            />
          ) : null}
        </div>
        {secondary ? (
          <div
            className={classNames(
              "p-double-row__secondary-row",
              "u-truncate",
              secondaryClassName
            )}
            aria-label={secondaryAriaLabel}
            title={secondaryTitle}
          >
            {secondary}
          </div>
        ) : null}
      </div>
    </div>
  );
};

DoubleRow.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.node,
  iconSpace: PropTypes.bool,
  iconTitle: PropTypes.string,
  menuClassName: PropTypes.string,
  menuLinks: TableMenu.propTypes.links,
  menuTitle: PropTypes.string,
  onToggleMenu: PropTypes.func,
  primary: PropTypes.node,
  primaryAriaLabel: PropTypes.string,
  primaryClassName: PropTypes.string,
  primaryTextClassName: PropTypes.string,
  primaryTitle: PropTypes.string,
  secondary: PropTypes.node,
  secondaryAriaLabel: PropTypes.string,
  secondaryClassName: PropTypes.string,
  secondaryTitle: PropTypes.string,
};

export default DoubleRow;
